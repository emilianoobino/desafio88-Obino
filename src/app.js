import express from "express";
import exphbs from "express-handlebars";
import session from "express-session";
import MongoStore from "connect-mongo";
import http from "http";
import { Server as SocketIO } from "socket.io";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import sessionRouter from "./routes/session.router.js";
import userRouter from "./routes/user.router.js";
import MessageModel from "./models/message.model.js";
import productService from "./services/product.service.js";
import cartService from "./services/cart.service.js";
import "./database.js";
import program from"./utils/commander.js";

const app = express();
const PUERTO = 8080;

// Crear servidor HTTP
const httpServer = http.createServer(app);

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
const hbs = exphbs.create({
    defaultLayout: 'main', 
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});

app.engine("handlebars", hbs.engine);
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
const io = new SocketIO(httpServer);

io.on("connection", async (socket) => {
    console.log("Nuevo usuario conectado");

    socket.on("message", async (data) => {
        // Guardar el mensaje en MongoDB
        await MessageModel.create(data);

        // Obtener los mensajes de MongoDB y enviarlos al cliente
        const messages = await MessageModel.find();
        console.log(messages);
        io.sockets.emit("message", messages);
    });

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
        await productService.addProduct(product);
        // Envía el array de productos actualizados
        socket.emit("products", await productService.getProducts());
    });

    // Envía los datos del carrito al cliente cuando se conecta
    socket.emit("cart", await cartService.getProductsFromCart());
});





