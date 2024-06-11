import CartModel from "../models/cart.model.js";

class CartService {
    async createCart() {
        try {
            const newCart = new CartModel({ products: [] });
            await newCart.save();
            return newCart;
        } catch (error) {
            throw new Error("Error al crear el nuevo carrito");
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await CartModel.findById(cartId).populate('products.product');
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
            return cart;
        } catch (error) {
            throw new Error("Error al traer el carrito");
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await this.getCartById(cartId);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
            const existingProduct = cart.products.find(item => item.product._id.toString() === productId);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }
            cart.markModified("products");
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error("Error al agregar un producto al carrito");
        }
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            cart.products = cart.products.filter(item => item.product._id.toString() !== productId);
            cart.markModified("products");
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error("Error al eliminar el producto del carrito");
        }
    }

    async updateCart(cartId, updatedProducts) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            cart.products = updatedProducts;
            cart.markModified('products');
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error("Error al actualizar el carrito");
        }
    }

    async updateProductQuantity(cartId, productId, newQuantity) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            const productIndex = cart.products.findIndex(item => item.product._id.toString() === productId);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = newQuantity;
                cart.markModified('products');
                await cart.save();
                return cart;
            } else {
                throw new Error('Producto no encontrado en el carrito');
            }
        } catch (error) {
            throw new Error("Error al actualizar la cantidad del producto en el carrito");
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await CartModel.findByIdAndUpdate(
                cartId,
                { products: [] },
                { new: true }
            );
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            return cart;
        } catch (error) {
            throw new Error("Error al vaciar el carrito");
        }
    }

    async getAllCarts() {
        try {
            const carts = await CartModel.find().populate('products.product');
            return carts;
        } catch (error) {
            throw new Error("Error al obtener los carritos");
        }
    }

    async getProductsFromCart(cartId) {
        try {
            const cart = await this.getCartById(cartId);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }
            return cart.products;
        } catch (error) {
            throw new Error("Error al obtener los productos del carrito");
        }
    }
}

export default new CartService();

