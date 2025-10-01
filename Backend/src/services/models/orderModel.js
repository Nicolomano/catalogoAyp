import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        quantity: { type: Number, required: true },
        priceUSD: Number,
        priceARS: Number,
      },
    ],
    totalUSD: { type: Number, required: true },
    totalARS: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    status: {
      type: String,
      enum: ["pendiente", "contestado"],
      default: "pendiente",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
