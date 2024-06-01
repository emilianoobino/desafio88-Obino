import ProductService from "../services/products.service.js";
const productService = new ProductService();


class ProductManager {
    async addProduct(req, res) {
        const newProduct = req.body; 
        try {
            await productService.addProduct(newProduct);
            
            respuesta(res, 200, "Producto creado exitosamente!");
        } catch (error) {
            
            respuesta(res, 500, "Error al crear producto");
        }
    }

    async getProducts(req, res) {
        try {
            let { limit = 10, page = 1, sort, query } = req.query;
            const products = await ProductService.getProducts(limit, page, sort, query);
                    res.json(products);
        } catch (error) {
            res.status(500).json("Error al obtener los productos en controller");
        }
    }
    async getProductById(req, res) {
        const id = req.params.pid;
        try {
            const prod = await ProductService.getProductById(id);
            if (!prod) {
                return res.json({
                    error: "Producto no encontrado en controler"
                });
            }
            res.json(prod)
        } catch (error) {
            res.status(500).send("Error");
        }
    }

}

export default ProductManager;