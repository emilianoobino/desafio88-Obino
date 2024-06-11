import 'dotenv/config';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github';
import bcrypt from 'bcryptjs';
import userModel from '../models/usuario.model.js';
import cartService from "../services/cart.service.js";
import CartModel from "../models/cart.model.js";

// Función para hashear la contraseña
const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

// Función para comparar la contraseña hasheada
const isValidPassword = (password, user) => {
    return bcrypt.compareSync(password, user.password);
};

// Función para inicializar Passport con nuestras estrategias
const initializePassport = () => {
    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
            let user = await userModel.findOne({ email });
            if (user) {
                return done(null, false, { message: 'El correo electrónico ya está registrado' });
            }

            const newCart = await cartService.createNewCart(); 

            let newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                cart: newCart._id
            };

            let resultado = await userModel.create(newUser);
            return done(null, resultado);
        } catch (error) {
            return done(error);
        }
    }));

    // Estrategia para autenticar un usuario ya registrado
    passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async (email, password, done) => {
        try {
            // Verificamos si existe un usuario con ese email
            let user = await userModel.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Usuario no encontrado' });
            }
            // Verificamos la contraseña
            if (!isValidPassword(password, user)) {
                return done(null, false, { message: 'Contraseña incorrecta' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // Estrategia para autenticación con GitHub
    passport.use('github', new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/api/sessions/github/callback'
    }, 
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Verificamos si ya existe un usuario con el email de GitHub
            const email = profile._json.email || `${profile.username}@github.com`; // usa el nombre de usuario si el correo no está disponible
            let user = await userModel.findOne({ email });
            if (!user) {
                // Si no existe, creamos un nuevo usuario y el carrito asociado
                const newCart = new CartModel({ products: [], quantity: 0 });
                await newCart.save();
                let newUser = {
                    first_name: profile._json.name || profile.username,
                    last_name: profile._json.name || profile.username,
                    email: email,
                    age: 18,
                    cart: newCart._id,
                    password: createHash('github')
                };
                let resultado = await userModel.create(newUser);
                done(null, resultado);
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }));

    // Serializar y deserializar el usuario para la sesión
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await userModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

export default initializePassport;
