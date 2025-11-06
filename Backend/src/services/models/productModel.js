import mongoose from "mongoose";
import Config from "./configModel.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    productCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },

    // 💰 precios
    priceUSD: { type: Number },
    priceARS: { type: Number },
    fixedInARS: { type: Boolean, default: false },

    // ✅ categorías y subcategorías como strings (no ObjectId)
    categories: [{ type: String, trim: true }],
    subcategories: [{ type: String, trim: true }],

    // 📊 estado y métricas
    active: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// 🔍 índices de texto para búsqueda
productSchema.index({ name: "text", productCode: "text", description: "text" });

// ⚙️ recalcula el precio en ARS si no es fijo
productSchema.pre("save", async function (next) {
  if (this.fixedInARS === true) return next();

  try {
    const cfg = await Config.findOne();
    const rate = cfg ? cfg.exchangeRate : 1;
    this.priceARS = Number(this.priceUSD) * Number(rate);
  } catch (err) {
    console.error("Error aplicando tasa de cambio:", err);
  }

  next();
});

export default mongoose.model("Product", productSchema);
