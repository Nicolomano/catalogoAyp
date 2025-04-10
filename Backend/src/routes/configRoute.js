import express from 'express';
import { updateExchangeRate } from '../controllers/configController.js';
const configRouter = express.Router();

configRouter.put('/', updateExchangeRate);


export default configRouter;