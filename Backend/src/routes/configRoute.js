import express from 'express';
import { updateExchangeRate , getExchangeRate} from '../controllers/configController.js';
import { config } from 'dotenv';
const configRouter = express.Router();

configRouter.put('/', updateExchangeRate);

configRouter.get('/', getExchangeRate);


export default configRouter;