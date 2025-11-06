import express from "express";
import {
  createProduct,
  uploadImage,
  updateProduct,
  getProductByCode,
  getProductsByCategory,
  deleteProduct,
  toggleProduct,
  getProductsAdmin,
  getCategoriesMeta,
  exportProductsExcel,
} from "../controllers/productsController.js";
const productRouter = express.Router();
import { protect } from "../middlewares/authMiddleware.js";
import uploadCloud from "../middlewares/multer.js";
import Category from "../services/models/category.js";

//subide de imagen
productRouter.post("/upload", uploadCloud.single("image"), uploadImage);

//public
productRouter.get("/meta/categories", async (req, res) => {
  try {
    // 1️⃣ Buscar todas las categorías
    const allCategories = await Category.find().lean();

    // 2️⃣ Filtrar las categorías principales (sin parent)
    const mainCategories = allCategories.filter((cat) => !cat.parent);

    // 3️⃣ Agrupar subcategorías según su parent
    const structured = mainCategories.map((cat) => {
      const subs = allCategories
        .filter((sub) => sub.parent?.toString() === cat._id.toString())
        .map((sub) => sub.name);
      return {
        category: cat.name,
        subcategories: subs,
      };
    });

    res.json(structured);
  } catch (error) {
    console.error("Error al obtener meta categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});
productRouter.get("/meta/categories", getCategoriesMeta);
productRouter.get("/", getProductsByCategory);
productRouter.get("/code/:productCode", getProductByCode);
productRouter.get("/:category", getProductsByCategory);

//productRouter.get("/:id", getProductByCode); // soporte para id directo

//admin
productRouter.post("/", protect, uploadCloud.single("image"), createProduct);
productRouter.put("/:id", protect, uploadCloud.single("image"), updateProduct);
productRouter.delete("/:id", protect, deleteProduct);
productRouter.patch("/:id/toggle", protect, toggleProduct);
productRouter.get("/admin/all", protect, getProductsAdmin);
productRouter.get("/export/excel", exportProductsExcel);

export default productRouter;
