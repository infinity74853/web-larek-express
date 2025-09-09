import express from 'express';
import createOrder from '../controllers/orderController';
import validateOrderBody from '../middlewares/validation-order';

const router = express.Router();

router.post('/', validateOrderBody, createOrder);

export default router;
