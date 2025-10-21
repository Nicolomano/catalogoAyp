import express from "express";
import {
  updateExchangeRate,
  getExchangeRate,
  getInstallKit,
  updateInstallKit,
} from "../controllers/configController.js";
import { config } from "dotenv";
import { protect } from "../middlewares/authMiddleware.js";
const configRouter = express.Router();

configRouter.put("/", protect, updateExchangeRate);

configRouter.get("/", getExchangeRate);
configRouter.get("/install-kit", getInstallKit);
configRouter.put("/install-kit", protect, updateInstallKit);

export default configRouter;
