// routes/kitRoutes.js
import express from "express";
import configModel from "../services/models/configModel.js";
import { priceInstallKit } from "../controllers/kitController.js";
const kitRouter = express.Router();
kitRouter.get("/install/meta", async (req, res) => {
  const cfg = await configModel.findOne().lean();
  const meta = cfg?.installKit?.items || [];
  res.json({ items: meta });
});
kitRouter.post("/install/price", priceInstallKit);

export default kitRouter;
