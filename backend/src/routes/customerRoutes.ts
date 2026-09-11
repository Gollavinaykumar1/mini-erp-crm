import { Router } from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer, addFollowup } from '../controllers/customerController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['SALES', 'ACCOUNTS']), getCustomers);
router.get('/:id', authorize(['SALES', 'ACCOUNTS']), getCustomerById);
router.post('/', authorize(['SALES']), createCustomer);
router.put('/:id', authorize(['SALES']), updateCustomer);
router.post('/:id/followups', authorize(['SALES']), addFollowup);

export default router;
