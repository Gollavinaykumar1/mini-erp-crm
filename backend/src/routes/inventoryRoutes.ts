import { Router } from 'express';
import { getStockMovements, createStockMovement } from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/movements', authorize(['WAREHOUSE', 'SALES', 'ACCOUNTS', 'ADMIN']), getStockMovements);
router.post('/movements', authorize(['WAREHOUSE', 'ADMIN']), createStockMovement);

export default router;
