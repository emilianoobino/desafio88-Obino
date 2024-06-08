const express = require("express");
const router = express.Router();
const ProductManager = require("../controllers/product.controller.js");
const CartManager = require("../controllers/cart.controller.js");
const productManager = new ProductManager();
const cartManager = new CartManager();
const mongoose = require("mongoose");
const messagesController = require("../controllers/messages.controller.js");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


// Ruta para obtener productos paginados
router.get("/products", async (req, res) => {
    try {
        const { page = 1, limit = 2 } = req.query;
        const products = await productManager.getProducts({
            page: parseInt(page),
            limit: parseInt(limit),
        });
        const nuevoArray = products.docs.map((producto) => {
            const { _id, ...rest } = producto.toObject();
            return rest;
        });

        res.render("products", {
            user: req.session.user,
            productos: nuevoArray,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            currentPage: products.page,
            totalPages: products.totalPages
        });
    } catch (error) {
        console.error("Error al obtener productos", error);
        res.status(500).json({
            status: 'error',
            error: "Error interno del servidor"
        });
    }
});
router.get("/products", productsController.getProductsView);


// Ruta para obtener productos en tiempo real
router.get("/realTimeProducts", productsController.getRealTimeProductsView);

// Ruta para el chat
router.get("/chat", messagesController.getChatView);


// Ruta para obtener el carrito por su ID
router.get("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;

    try {
        const carrito = await cartManager.getCarritoById(cartId);

        if (!carrito) {
            console.log("No existe ese carrito con el id");
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        const productosEnCarrito = carrito.products.map(item => ({
            product: item.product.toObject(),
            quantity: item.quantity
        }));

        res.render("carts", { productos: productosEnCarrito });
    } catch (error) {
        console.error("Error al obtener el carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Ruta para el formulario de login
router.get("/login", (req, res) => {
    
    if (req.session.login) {
        return res.redirect("/products");
    }
    res.render("login");
});

// Ruta para el formulario de registro
router.get("/register", (req, res) => {
    
    if (req.session.login) {
        return res.redirect("/profile");
    }
    res.render("register");
});

// Ruta para la vista de perfil
router.get("/profile", (req, res) => {
    
    if (!req.session.login) {
        
        return res.redirect("/login");
    }

    res.render("profile", { user: req.session.user });
});

module.exports = router;

