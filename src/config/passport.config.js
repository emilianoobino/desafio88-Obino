import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import UsuarioModel from "../models/usuario.model.js";
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";
import CartManager from "../controllers/cart-manager-db.js";
const cartManager = new CartManager();


const LocalStrategy = local.Strategy;

const initializePassport = () => {
    
    //Registro y Login. 

    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;

        let nuevoCarrito = await cartManager.createCart();

        try {
            //Verificamos si ya existe un registro con ese email: 
            let usuario = await UsuarioModel.findOne({ email });

            if (usuario) {
                return done(null, false);
            }

            //Si no existe voy a crear un registro de usuario nuevo: 

            let nuevoUsuario = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password), cart: nuevoCarrito
            }

            let resultado = await UsuarioModel.create(nuevoUsuario);
            return done(null, resultado);
            //Si todo resulta bien, podemos mandar done con el usuario generado. 
        } catch (error) {
            return done(error);
        }
    }))

    //Agregamos otra estrategia para el "Login".
    passport.use("login", new LocalStrategy({
        usernameField: "email"
    }, async (email, password, done) => {

        try {
            //Primero verifico si existe un usuario con ese email: 
            let usuario = await UsuarioModel.findOne({ email });

            if (!usuario) {
                console.log("Este usuario no existe");
                return done(null, false);
            }

            //Si existe verifico la contraseña: 
            if (!isValidPassword(password, usuario)) {
                return done(null, false);
            }
            return done(null, usuario);
        } catch (error) {
            return done(error);
        }
    }))

    //Serializar y deserializar: 

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await UsuarioModel.findById({ _id: id });
        done(null, user);
    })

    //Acá generamos la nueva estrategia con GitHub: 

    passport.use("github", new GitHubStrategy({
        clientID: "Iv23liDwc5CFBpLdz4i1",
        clientSecret: "219e89bad45bb1ae352a927f10b4cd6f6714f307",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        //Veo los datos del perfil
        console.log("Profile:", profile);

        try {
            let usuario = await UsuarioModel.findOne({ email: profile._json.email });

            if (!usuario) {
                let nuevoUsuario = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 36,
                    email: profile._json.email,
                    password: "miau"
                }

                let resultado = await UsuarioModel.create(nuevoUsuario);
                done(null, resultado);
            } else {
                done(null, usuario);
            }
        } catch (error) {
            return done(error);
        }
    }))
}

export default initializePassport;