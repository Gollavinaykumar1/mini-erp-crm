import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct } from '../controllers/productController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['SALES', 'WAREHOUSE', 'ACCOUNTS', 'ADMIN']), getProducts);
router.get('/:id', authorize(['SALES', 'WAREHOUSE', 'ACCOUNTS', 'ADMIN']), getProductById);
router.post('/', authorize(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', authorize(['ADMIN', 'WAREHOUSE']), updateProduct);

export default router;
