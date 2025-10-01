import mongoose from "mongoose";
import configModel from "./configModel.js";

const productsCollection = "products";
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  priceUSD: Number,
  priceARS: Number,
  category: String,
  image: String,
  productCode: {
    type: String,
    unique: true,
    required: true,
  },
  active: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
});

productSchema.pre("save", async function (next) {
  const Config = configModel;
  const config = await Config.findOne();
  const exchangeRate = config ? config.exchangeRate : 1;
  this.priceARS = this.priceUSD * exchangeRate;
  next();
});

const productModel = mongoose.model(productsCollection, productSchema);
export default productModel;
