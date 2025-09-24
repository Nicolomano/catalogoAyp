import { Router } from "express";
import { login, registerAdmin } from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/register", registerAdmin);
authRouter.post("/login", login);

export default authRouter;
