import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    image: { type: String, required: true }, // URL Cloudinary
    linkUrl: String, // opcional
    type: { type: String, enum: ["home", "catalog"], default: "home" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Banner = mongoose.model("banners", bannerSchema);
export default Banner;
