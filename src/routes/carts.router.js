import express from "express";
import cartController from "../controllers/cart.controller.js"; 
// Asegúrate de que cart.controller.js también use ES Modules

const router = express.Router();

router.post("/", cartController.createCart);
router.get("/", cartController.getCarts);
router.get("/:id", cartController.getCartById);
router.put("/:id", cartController.updateCart);
router.delete("/:id", cartController.deleteCart);
router.get("/:id/products", cartController.getProductsFromCart);
router.post("/:id/products", cartController.addProductToCart);
router.delete("/:id/products/:productId", cartController.deleteProductById);
router.post("/:id/clear", cartController.clearCart);

export default router; // ES Modules export


 


