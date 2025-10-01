import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

const orderRouter = Router();

orderRouter.post("/", createOrder); // crear orden + waLink
orderRouter.get("/", getOrders); // listar todas
orderRouter.get("/:id", getOrderById); // ver una
orderRouter.patch("/:id/status", updateOrderStatus);

export default orderRouter;
