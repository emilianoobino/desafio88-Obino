import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import UsuarioModel from "../models/usuario.model.js";
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";
import CartManager from "../controllers/cart-manager-db.js";

const cartManager = new CartManager();
const LocalStrategy = local.Strategy;

const initializePassport = () => {
    // Estrategia de registro
    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;

        try {
            // Verificamos si ya existe un registro con ese email
            let usuario = await UsuarioModel.findOne({ email });
            if (usuario) {
                return done(null, false, { message: "El usuario ya existe" });
            }

            // Crear un nuevo carrito
            let nuevoCarrito = await cartManager.crearCarrito();

            // Crear un registro de usuario nuevo
            let nuevoUsuario = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                cart: nuevoCarrito._id // Solo almacenamos la referencia del carrito
            };

            let resultado = await UsuarioModel.create(nuevoUsuario);
            return done(null, resultado);
        } catch (error) {
            return done(error);
        }
    }));

    // Estrategia de login
    passport.use("login", new LocalStrategy({
        usernameField: "email"
    }, async (email, password, done) => {
        try {
            // Verificar si existe un usuario con ese email
            let usuario = await UsuarioModel.findOne({ email });
            if (!usuario) {
                return done(null, false, { message: "Usuario no encontrado" });
            }

            // Verificar la contraseña
            if (!isValidPassword(password, usuario)) {
                return done(null, false, { message: "Contraseña incorrecta" });
            }

            return done(null, usuario);
        } catch (error) {
            return done(error);
        }
    }));

    // Serializar y deserializar usuario
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await UsuarioModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });

    // Estrategia de GitHub
    passport.use("github", new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let usuario = await UsuarioModel.findOne({ email: profile._json.email });

            if (!usuario) {
                let nuevoUsuario = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 36,
                    email: profile._json.email,
                    password: "miau" // Considera usar un valor hash o más seguro
                };

                let resultado = await UsuarioModel.create(nuevoUsuario);
                done(null, resultado);
            } else {
                done(null, usuario);
            }
        } catch (error) {
            return done(error);
        }
    }));
};

export default initializePassport;
