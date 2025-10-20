import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: String,
    unit: { type: String, enum: ["m", "u"], default: "m" },
    step: { type: Number, default: 0.5 },
    defaultQty: { type: Number, default: 0 },
    productCode: String,
    variants: [{ value: String, productCode: String }],
  },
  { _id: false }
);

const configSchema = new mongoose.Schema(
  {
    exchangeRate: {
      type: Number,
      required: true,
    }, //tipo de cambio de USD a ARS
    installKit: {
      items: { type: [itemSchema], default: [] },
    },
  },
  { timestamps: true }
);

const Config = mongoose.model("Config", configSchema);
export default Config;
