import productModel from "../services/models/productModel.js";
import Config from "../services/models/configModel.js";

export async function createProduct(req, res) {
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
      productCode,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({
      message: "Error creating product",
      error: error.message,
      stack: error.stack,
    });
  }
}

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ imageUrl: req.file.secure_url });
}

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await Config.findOne();
    const exchangeRate = config ? config.exchangeRate : 1;

    const updateData = {
      name: req.body.name,
      productCode: req.body.productCode,
      priceUSD: parseFloat(req.body.priceUSD),
      category: req.body.category,
    };

    updateData.priceARS = updateData.priceUSD * exchangeRate;
    // Si viene imagen de Cloudinary
    if (req.file && req.file.path) {
      updateData.image = req.file.path;
    }

    const updated = await productModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Error actualizando producto",
      error: error.message,
    });
  }
};

/// Obtener producto por código
export async function getProductByCode(req, res) {
  const { productCode } = req.params;
  try {
    const product = await productModel.findOne({
      productCode: productCode.toString(),
      active: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: `No se encontró producto con código ${productCode}` });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("💥 Error obteniendo producto:", error);
    res.status(500).json({
      message: "Error buscando producto",
      error: error.message,
    });
  }
}

//obtener productos por categoria

export const getProductsByCategory = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // 🔹 Filtros
    let filter = { active: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" }; // búsqueda insensible a mayúsculas
    }

    if (minPrice || maxPrice) {
      filter.priceARS = {};
      if (minPrice) filter.priceARS.$gte = Number(minPrice);
      if (maxPrice) filter.priceARS.$lte = Number(maxPrice);
    }

    // 🔹 Paginación
    const skip = (Number(page) - 1) * Number(limit);

    // 🔹 Ordenamiento
    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split(":");
      sortOption[field] = order === "desc" ? -1 : 1;
    }

    const products = await productModel
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await productModel.countDocuments(filter);

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error buscando productos",
      error: error.message,
    });
  }
};

export async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const product = await productModel.findOneAndDelete({
      _id: id.toString(),
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: `No se encontró producto con código ${productCode}` });
    }

    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("error eliminando producto:", error);
    res.status(500).json({
      message: "Error eliminando producto",
      error: error.message,
    });
  }
}

export const toggleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    product.active = !product.active;
    await product.save();

    res.json({
      message: `Producto ${
        product.active ? "activado" : "desactivado"
      } con éxito`,
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al cambiar estado de producto",
      error: error.message,
    });
  }
};

export const getProductByCodeAdmin = async (req, res) => {
  const { productCode } = req.params;
  try {
    const product = await productModel.findOne({
      productCode: productCode.toString(),
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: `No se encontró producto con código ${productCode}` });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("💥 Error obteniendo producto (admin):", error);
    res.status(500).json({
      message: "Error buscando producto (admin)",
      error: error.message,
    });
  }
};

export const getProductsAdmin = async (req, res) => {
  try {
    const products = await productModel.find().lean();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo productos (admin)",
      error: error.message,
    });
  }
};

export const getProductById = async (id) => {
  try {
    const product = await productModel.findById(id).lean();
    return product;
  } catch (error) {
    res.status(500).json({
      message: "Error buscando producto por ID",
      error: error.message,
    });
  }
};
