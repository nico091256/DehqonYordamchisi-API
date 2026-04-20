import { Router } from 'express';
import { createOrder, updateOrderStatus, getMyOrders } from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['BUYER']), createOrder);
router.patch('/:id/status', authorize(['FARMER']), updateOrderStatus);
router.get('/my', getMyOrders);

export default router;
