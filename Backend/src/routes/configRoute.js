import express from "express";
import {
  updateExchangeRate,
  getExchangeRate,
} from "../controllers/configController.js";
import { config } from "dotenv";
import { protect } from "../middlewares/authMiddleware.js";
const configRouter = express.Router();

configRouter.put("/", protect, updateExchangeRate);

configRouter.get("/", getExchangeRate);

export default configRouter;
