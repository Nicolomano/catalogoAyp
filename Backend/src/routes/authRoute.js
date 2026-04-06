import { Router } from "express";
import {
  login,
  registerAdmin,
  registerUser,
  getServiceUsers,
  updateServiceUserApproval,
} from "../controllers/authController.js";
import { authMiddleware, adminOnly } from "../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.post("/register", registerAdmin);
authRouter.post("/register-service", registerUser);
authRouter.post("/login", login);

// Admin-only: manage service users
authRouter.get("/service-users", authMiddleware, adminOnly, getServiceUsers);
authRouter.patch("/service-users/:id/approval", authMiddleware, adminOnly, updateServiceUserApproval);

export default authRouter;
