import cartService from "../services/cart.service.js";

const CartController = {
    createCart: async (req, res) => {
        try {
            const newCart = await cartService.createCart();
            res.status(201).json(newCart);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getCartById: async (req, res) => {
        try {
            const cart = await cartService.getCartById(req.params.id);
            res.render('carts', { cart });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    updateCart: async (req, res) => {
        try {
            const updatedCart = await cartService.updateCart(req.params.id, req.body);
            res.json(updatedCart);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    deleteCart: async (req, res) => {
        try {
            await cartService.deleteCart(req.params.id);
            res.json({ message: "Carrito eliminado con éxito" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getCarts: async (req, res) => {
        try {
            const carts = await cartService.getAllCarts();
            res.render('carts', { carts });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getProductsFromCart: async (req, res) => {
        try {
            const products = await cartService.getProductsFromCart(req.params.id);
            res.render('carts', { products });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    addProductToCart: async (req, res) => {
        try {
            const cart = await cartService.addProductToCart(req.params.id, req.body.product, req.body.quantity);
            res.render('carts', { cart });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteProductById: async (req, res) => {
        try {
            const cart = await cartService.deleteProductFromCart(req.params.id, req.params.productId);
            res.render('carts', { cart });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    clearCart: async (req, res) => {
        try {
            const cart = await cartService.clearCart(req.params.id);
            res.render('carts', { cart });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default CartController;


