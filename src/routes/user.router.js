import express from "express";
const router = express.Router();
//import UsuarioModel from "../models/usuario.model.js";
//import { createHash } from "../utils/hashbcryp.js";
import passport from "passport";

 //VERSION PARA PASSPORT: 
//(estrategia local)

router.post("/", passport.authenticate("register", {
    failureRedirect: "/failedregister"
}), async (req, res) => {
    if(!req.user) {
        return res.status(400).send("Credenciales invalidas"); 
    }

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email
    };

    req.session.login = true;

    res.redirect("/profile");

})

router.get("/failedregister", (req, res) => {
    res.send("Registro Fallido!");
})

export default router; 