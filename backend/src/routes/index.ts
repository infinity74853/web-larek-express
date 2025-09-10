import { Router } from 'express';
import productRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import authRoutes from './authRoutes';
import uploadRoutes from './uploadRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/product', productRoutes);
router.use('/order', orderRoutes);

export default router;
