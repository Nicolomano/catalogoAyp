import express from "express";
import {
  listPublicBanners,
  listAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBanner,
  reorderBanners,
} from "../controllers/bannerController.js";
import { protect } from "../middlewares/authMiddleware.js";
import uploadBanner from "../middlewares/multerBanners.js";

const router = express.Router();

// Público
router.get("/", listPublicBanners);

// Admin
router.get("/admin/all", protect, listAdminBanners);
router.post("/", protect, uploadBanner.single("image"), createBanner);
router.put("/:id", protect, uploadBanner.single("image"), updateBanner);
router.delete("/:id", protect, deleteBanner);
router.patch("/:id/toggle", protect, toggleBanner);
router.patch("/reorder", protect, reorderBanners);

export default router;
