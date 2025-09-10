import express from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import {
  validateProductBody,
  validateObjId,
  validateProductUpdateBody,
} from '../middlewares/validation-product';
import auth from '../middlewares/auth';

const router = express.Router();

router.get('/', getProducts);
router.post('/', validateProductBody, createProduct);
router.patch('/:productId', auth, validateObjId, validateProductUpdateBody, updateProduct);
router.delete('/:productId', auth, validateObjId, deleteProduct);

export default router;
