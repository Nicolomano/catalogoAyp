import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "banners",
    allowed_formats: ["jpg", "png", "jpeg"],
    // normalizamos a 3:1 para tu faja
    transformation: [{ crop: "fill", gravity: "auto", aspect_ratio: "3:1" }],
  },
});

const uploadBanner = multer({ storage });
export default uploadBanner;
