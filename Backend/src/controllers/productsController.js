import productModel from "../services/models/productModel.js";
import Config from "../services/models/configModel.js";

export async function createProduct(req, res) {
  const {
    name,
    description,
    priceUSD,
    priceARS,
    fixedInArs,
    category,
    subcategory,
    productCode,
  } = req.body;
  const image = req.file ? req.file.secure_url || req.file.path : null;
  if (!name || !description || !priceUSD || !category || !productCode) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const newProduct = new productModel({
      name,
      description,
      priceUSD: priceUSD !== undefined ? parseFloat(priceUSD) : undefined,
      priceARS: priceARS !== undefined ? parseFloat(priceARS) : undefined,
      fixedInArs: Boolean(fixedInArs),
      category,
      subcategory,
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

    // Leer el estado actual para decidir cuando no vienen campos
    const current = await productModel.findById(id).lean();
    if (!current)
      return res.status(404).json({ message: "Producto no encontrado" });

    // Normalizar boolean que llega como string en multipart/form-data
    const fixedFlag =
      req.body.fixedInARS !== undefined
        ? String(req.body.fixedInARS).toLowerCase() === "true"
        : undefined;

    const updateData = {
      name: req.body.name,
      productCode: req.body.productCode,
      priceUSD:
        req.body.priceUSD !== undefined && req.body.priceUSD !== ""
          ? Number(req.body.priceUSD)
          : undefined,
      priceARS:
        req.body.priceARS !== undefined && req.body.priceARS !== ""
          ? Number(req.body.priceARS)
          : undefined,
      // solo setear si vino; si no, conservar el valor actual
      fixedInARS: fixedFlag !== undefined ? fixedFlag : undefined,
      category: req.body.category,
      subcategory: req.body.subcategory,
    };

    if (req.file?.path) {
      updateData.image = req.file.path;
    }

    // Decidir el valor efectivo de fixedInARS para la lógica de precios
    const effectiveFixed =
      fixedFlag !== undefined ? fixedFlag : current.fixedInARS;

    // Si NO es fijo y vino un USD nuevo → recalcular ARS
    if (effectiveFixed === false && updateData.priceUSD != null) {
      const cfg = await Config.findOne();
      const rate = cfg ? cfg.exchangeRate : 1;
      updateData.priceARS = Number(updateData.priceUSD) * Number(rate || 1);
    }

    // Si ES fijo y NO vino un ARS nuevo → no tocar el ARS existente
    if (effectiveFixed === true && updateData.priceARS === undefined) {
      delete updateData.priceARS;
    }

    // Evitar enviar undefineds en el update
    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k]
    );

    const updated = await productModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error actualizando producto", error: error.message });
  }
};

/// Obtener producto por código
export async function getProductByCode(req, res) {
  const { productCode } = req.params;
  try {
    const product = await productModel.findOneAndUpdate(
      {
        productCode: productCode.toString(),
        active: true,
      },
      { $inc: { views: 1 } },
      { new: true }
    );

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
      subcategory,
      search,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 0,
    } = req.query;

    // 🔹 Filtros
    let filter = { active: true };

    if (category) {
      filter.category = category;
    }
    if (subcategory) {
      filter.subcategory = subcategory;
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
// controllers/productsController.js
export const getProductsAdmin = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 20,
      category,
      subcategory,
      sort, // ej: "createdAt:desc" o "name:asc"
      active, // opcional: "true"/"false"
    } = req.query;

    const filter = {};
    if (search) {
      const term = new RegExp(search.trim(), "i");
      filter.$or = [{ name: term }, { productCode: term }];
    }
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (active === "true") filter.active = true;
    if (active === "false") filter.active = false;

    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split(":");
      sortOption[field] = order === "desc" ? -1 : 1;
    } else {
      sortOption = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      productModel
        .find(filter)
        .sort(sortOption)
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      productModel.countDocuments(filter),
    ]);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit || 1)),
      products,
    });
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

export const getCategoriesMeta = async (req, res) => {
  try {
    const onlyActive = req.query.active !== "false"; // por defecto solo activos
    const match = onlyActive ? { active: true } : {};

    const docs = await productModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          subs: { $addToSet: "$subcategory" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Normalizamos la salida a { category, subcategories[] }
    const payload = docs.map((d) => ({
      category: d._id,
      subcategories: (d.subs || []).filter(Boolean).sort(),
    }));

    res.json(payload);
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo categorías y subcategorías",
      error: error.message,
    });
  }
};
