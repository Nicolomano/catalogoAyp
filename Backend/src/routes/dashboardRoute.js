import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const dashboardRouter = express.Router();
dashboardRouter.get("/", protect, getDashboardData);
export default dashboardRouter;
