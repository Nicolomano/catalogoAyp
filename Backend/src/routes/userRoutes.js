import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  listUsers,
  updateUserStatus,
  getPendingCount,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { protectUser } from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// User protected
router.get("/me", protectUser, getMe);

// Admin protected
router.get("/pending-count", protect, getPendingCount);
router.get("/", protect, listUsers);
router.patch("/:id/status", protect, updateUserStatus);

export default router;
