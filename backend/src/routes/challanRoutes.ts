import { Router } from 'express';
import { getChallans, getChallanById, createChallan, confirmChallan, cancelChallan } from '../controllers/challanController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['SALES', 'WAREHOUSE', 'ACCOUNTS', 'ADMIN']), getChallans);
router.get('/:id', authorize(['SALES', 'WAREHOUSE', 'ACCOUNTS', 'ADMIN']), getChallanById);
router.post('/', authorize(['SALES', 'ADMIN']), createChallan);
router.post('/:id/confirm', authorize(['SALES', 'ADMIN']), confirmChallan);
router.post('/:id/cancel', authorize(['SALES', 'ADMIN']), cancelChallan);

export default router;
