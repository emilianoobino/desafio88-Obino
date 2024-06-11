import express from "express";
import passport from "passport";
import productsController from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", passport.authenticate('session'), productsController.getProductsView);
router.get("/realTimeProducts", passport.authenticate('session'), productsController.getRealTimeProductsView);
router.post("/products", passport.authenticate('session'), productsController.createProduct);
router.get("/products/:id", passport.authenticate('session'), productsController.getProductById);
router.put("/products/:id", passport.authenticate('session'), productsController.updateProduct);
router.delete("/products/:id", passport.authenticate('session'), productsController.deleteProduct);

export default router;
