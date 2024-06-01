import ProductModel from "../models/product.model.js";

class ProductService {
    async addProduct(newObject){
        try {
            let { title, description, price, thumbnail, code, category, stock } =
            newObject;

            //verificaciones
            if (
                !title ||
                !description ||
                !price ||
                !thumbnail ||
                !code ||
                !category ||
                !stock
            ) {
                console.log("Todos los campos son obligatorios");
                return;
            }

            const productExist = await ProductModel.findOne({ code: code });
            if (productExist) {
                console.log("El codigo debe ser unico");
                return;
            }

            //generar producto
            const newProduct = new ProductModel({
                title,
                description,
                price,
                thumbnail,
                category,
                code,
                stock,
                status: true,
            });
            await newProduct.save();
            return newProduct;
        } catch (error) {
            throw new Error("Error al crear el producto");
        }

    }

    //get products
  async getProducts(limit = 5, page = 1, sort, query) {
    try {
      const skip = (page - 1) * limit;
      let queryOptions = {};
      if (query) {
        queryOptions = { category: query };
      }

      const sortOptions = {};
      if (sort) {
        if (sort === "asc" || sort === "desc") {
          sortOptions.price = sort === "asc" ? 1 : -1;
        }
      }

      const products = await ProductModel.find(queryOptions)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const totalProducts = await ProductModel.countDocuments(queryOptions);
      const totalPages = Math.ceil(totalProducts / limit);
      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;
      return {
        docs: products,
        totalPages,
        prevPage: hasPrevPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage
          ? `/products?limit=${limit}&page=${
              page - 1
            }&sort=${sort}&query=${query}`
          : null,
        nextLink: hasNextPage
          ? `/products?limit=${limit}&page=${
              page + 1
            }&sort=${sort}&query=${query}`
          : null,
      };
    } catch (error) {
      console.log("Error al recuperar productos en product manager", error);
      throw error;
    }
  }

  //get product by id
  async getProductById(id) {
    try {
      const product = await ProductModel.findById(id);
      if (!product) {
        console.log("Producto no encontrado");
        return null;
      } else {
        console.log("Producto encontrado! ");
        return product;
      }
    } catch (error) {
      console.log("Error al leer el archivo ", error);
    }
  }

  //actualizar producto
  async updateProduct(id, productoActualizado) {
    try {
      const updateProduct = await ProductModel.findByIdAndUpdate(
        id,
        productoActualizado
      );
      if (!updateProduct) {
        console.log("Producto no encontrado");
        return null;
      }
      console.log("Producto actualizado correctamente");
      return updateProduct;
    } catch (error) {
      console.log("Error al actualizar el producto", error);
    }
  }
  // eliminar producto
  async deleteProduct(id) {
    try {
      const deleteProduct = await ProductModel.findByIdAndDelete(id);
      if (!deleteProduct) {
        console.log("Producto no encontrado");
        return null;
      }
      console.log("Producto eliminado correctamente");
    } catch (error) {
      console.log("Error al eliminar el producto", error);
    }
  }
}

export default ProductService;