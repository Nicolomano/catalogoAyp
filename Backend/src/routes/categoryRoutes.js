import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoriesTree,
  deleteCategory,
} from "../controllers/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.post("/", createCategory); // Crear categoría
categoryRouter.get("/", getAllCategories); // Listar planas
categoryRouter.get("/tree", getCategoriesTree); // 🌳 Árbol jerárquico
categoryRouter.delete("/:id", deleteCategory); // Eliminar categoría

export default categoryRouter;
