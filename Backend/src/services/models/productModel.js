import mongoose from "mongoose";
import configModel from "./configModel.js";

const productsCollection = "products";
const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    priceUSD: Number,
    priceARS: Number,
    category: String,
    subcategory: { type: String },
    image: String,
    productCode: {
      type: String,
      unique: true,
      required: true,
    },
    active: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    fixedInARS: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ createdAt: -1 });

productSchema.pre("save", async function (next) {
  if (this.fixedInARS === true) return next(); //respeta el precio fijo en ARS
  const Config = configModel;
  const config = await Config.findOne();
  const exchangeRate = config ? config.exchangeRate : 1;
  this.priceARS = this.priceUSD * exchangeRate;
  next();
});
// services/models/productModel.js (después del schema)
productSchema.index({ name: "text", productCode: "text" });
productSchema.index({ category: 1, subcategory: 1 });

const productModel = mongoose.model(productsCollection, productSchema);
export default productModel;
