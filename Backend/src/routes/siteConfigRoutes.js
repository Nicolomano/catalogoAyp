import express from "express";
import { getConfig, updateConfig } from "../controllers/siteConfigController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getConfig);          // público — lo lee la landing
router.put("/", protect, updateConfig); // solo admin

export default router;
