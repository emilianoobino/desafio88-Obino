import express from "express";
const app = express();
import exphbs from "express-handlebars";
import session from "express-session";
import MongoStore from "connect-mongo";
const http = require("http");
const socket = require("socket.io");
const PUERTO = 8080;
require("./database.js");
const session = require("express-session");
import passport from "passport";
import initializePassport from "./config/passport.config.js";

// Crear servidor HTTP
const httpServer = http.createServer(app);

const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const sessionRouter = require("./routes/session.router.js");
const userRouter = require("./routes/user.router.js");

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));
//Session
app.use(session({
    secret:"secretCoder",
    resave: true, 
    saveUninitialized:true,
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://chaval198678:tonyfunko@cluster0.6l6psjf.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0", ttl: 100   
    })
}))

//Cambios passport: 
app.use(passport.initialize());
app.use(passport.session());
initializePassport(); 

//Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

//Rutas: 
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/user", userRouter);
app.use("/api/sessions", sessionRouter);
app.use("/", viewsRouter);

httpServer.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});

//chat en el ecommerce: 
const MessageModel = require("./models/message.model.js");
const io = new socket.Server(httpServer);

io.on("connection",  (socket) => {
    console.log("Nuevo usuario conectado");

    socket.on("message", async data => {

        //Guardo el mensaje en MongoDB: 
        await MessageModel.create(data);

        //Obtengo los mensajes de MongoDB y se los paso al cliente: 
        const messages = await MessageModel.find();
        console.log(messages);
        io.sockets.emit("message", messages);
     
    })
})


