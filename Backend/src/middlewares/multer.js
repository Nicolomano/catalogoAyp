import multer from "multer";
import {CloudinaryStorage} from "multer-storage-cloudinary";
import cloudinary from '../utils/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "products",
        allowed_formats: ["jpg", "png", "jpeg"],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
    

})

const uploadCloud = multer({ storage });

export default uploadCloud;