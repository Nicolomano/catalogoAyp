import express from 'express';
import { createProduct, uploadImage, updateProduct, getProductByCode, getProductsByCategory} from '../controllers/productsController.js';
const productRouter = express.Router();
import uploadCloud from '../middlewares/multer.js';

productRouter.post('/upload', uploadCloud.single('image'), uploadImage)

productRouter.post('/', uploadCloud.single('image'), createProduct);

productRouter.get('/', getProductsByCategory)

productRouter.put('/:productCode', uploadCloud.single('image'), updateProduct);

productRouter.get('/:productCode', getProductByCode)





export default productRouter;