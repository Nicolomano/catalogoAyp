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
  getProductByCodeAdmin,
} from "../controllers/productsController.js";
const productRouter = express.Router();
import { protect } from "../middlewares/authMiddleware.js";
import uploadCloud from "../middlewares/multer.js";

//subide de imagen
productRouter.post("/upload", uploadCloud.single("image"), uploadImage);

//public
productRouter.get("/", getProductsByCategory);
productRouter.get("/:category", getProductsByCategory);
productRouter.get("/code/:productCode", getProductByCode);
//productRouter.get("/:id", getProductByCode); // soporte para id directo

//admin
productRouter.post("/", protect, uploadCloud.single("image"), createProduct);
productRouter.put(
  "/:productCode",
  protect,
  uploadCloud.single("image"),
  updateProduct
);
productRouter.delete("/:productCode", protect, deleteProduct);
productRouter.patch("/:productCode/toggle", protect, toggleProduct);
productRouter.get("/admin/all", protect, getProductsAdmin);
productRouter.get("/admin/code/:productCode", protect, getProductByCodeAdmin);

export default productRouter;
