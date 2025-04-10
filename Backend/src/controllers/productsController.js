import productModel from "../services/models/productModel.js";


export async function createProduct(req,res){
    const { name, description, priceUSD, category, productCode } = req.body;
    const image = req.file ? req.file.secure_url || req.file.path : null;
    if (!name || !description || !priceUSD || !category || !productCode) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const newProduct = new productModel({
            name,
            description,
            priceUSD: parseFloat(priceUSD),
            category,
            image,
            productCode
        });
        await newProduct.save()
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ 
            message: "Error creating product", 
            error: error.message, 
            stack: error.stack 
          });
    }
}

export async function uploadImage(req,res){
    if(!req.file){
        return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ imageUrl: req.file.secure_url });

}

export async function updateProduct(req, res) {
    const { productCode } = req.params;
    const { name, description, priceUSD, category } = req.body;
    const image = req.file ? req.file.secure_url || req.file.path : null;
  
    try {
      const product = await productModel.findOne({ productCode: productCode.toString() });
  
      if (!product) {
        return res.status(404).json({ message: `No se encontró producto con código ${productCode}` });
      }
  
      if (name) product.name = name;
      if (description) product.description = description;
      if (priceUSD) product.priceUSD = parseFloat(priceUSD);
      if (category) product.category = category;
      if (image) product.image = image;
  
      await product.save();
  
      res.status(200).json({
        message: "Producto actualizado exitosamente",
        product
      });
  
    } catch (error) {
      console.error("💥 Error actualizando producto:", error);
      res.status(500).json({
        message: "Error actualizando producto",
        error: error.message
      });
    }
  }
  
/// Obtener producto por código
  export async function getProductByCode(req, res) {
    const { productCode } = req.params;
  
    try {
      const product = await productModel.findOne({ productCode: productCode.toString() });
  
      if (!product) {
        return res.status(404).json({ message: `No se encontró producto con código ${productCode}` });
      }
  
      res.status(200).json(product);
    } catch (error) {
      console.error("💥 Error obteniendo producto:", error);
      res.status(500).json({
        message: "Error buscando producto",
        error: error.message
      });
    }
  }

  //obtener productos por categoria

    export async function getProductsByCategory(req, res) {
        const {category} = req.params;

        try {
            let filter = {}
            if (category) {
                filter.category = category;
            }
            const products = await productModel.find(filter).lean();

            res.status(200).json(products);
        } catch (error) {
            error.status(500).json({
                message: "Error buscando productos",
                error: error.message
            });
        }
    }