import express from "express";
import exphbs from "express-handlebars";
import session from "express-session";
import MongoStore from "connect-mongo";
import http from "http";
import socket from "socket.io";
import passport from "passport";
import initializePassport from "./config/passport.config.js";


const program = require("./utils/commander.js");

const app = express();
const PUERTO = 8080;
require("./database.js");

// Crear servidor HTTP
const httpServer = http.createServer(app);

const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const sessionRouter = require("./routes/session.router.js");
const userRouter = require("./routes/user.router.js");
const MessageModel = require("./models/message.model.js");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));

// Session
app.use(session({
    secret: "secretCoder",
    resave: true, 
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://chaval198678:tonyfunko@cluster0.6l6psjf.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0", 
        ttl: 100   
    })
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());
initializePassport(); 

// Handlebars
const hbs = expresshandlebars.create({
    defaultLayout: 'main', 
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/user", userRouter);
app.use("/api/sessions", sessionRouter);
app.use("/", viewsRouter);

httpServer.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});

// Chat en el ecommerce
const MessageModel = require("./models/message.model.js");
const io = new socket.Server(httpServer);

io.on("connection", socket => {
    console.log("Nuevo usuario conectado");

    socket.on("message", async data => {
        // Guardar el mensaje en MongoDB
        await MessageModel.create(data);

        // Obtener los mensajes de MongoDB y enviarlos al cliente
        const messages = await MessageModel.find();
        console.log(messages);
        io.sockets.emit("message", messages);
    });
});

// Manejo de eventos de productos
const productService = require("./services/product.service.js");


io.on("connection", async (socket) => {
    console.log("Un cliente conectado");

    // Envía array de productos al cliente
    socket.emit("products", await productService.getProducts());

    // Recibe el evento deleteProduct desde el cliente
    socket.on("removeProduct", async (id) => {
        await productService.deleteProduct(id);
        // Envía el array de productos actualizados
        socket.emit("products", await productService.getProducts());
    });

    // Recibe el evento addProduct desde el cliente
    socket.on("addProduct", async (product) => {
        await productManager.addProduct(product);
        // Envía el array de productos actualizados
        socket.emit("products", await productManager.getProducts());
    });
});


// Manejo de eventos de carrito
const cartService = require("./services/cart.service.js");

io.on("connection", async (socket) => {
    console.log("Un cliente conectado");

    // Envía los datos del carrito al cliente cuando se conecta
    socket.emit("cart", await cartService.getProductsFromCart());
});



