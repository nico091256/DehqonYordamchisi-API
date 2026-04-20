import { Router } from 'express';
import { getDashboardStats, manageUser, getAllUsers } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate, authorize(['ADMIN']));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id', manageUser);

export default router;
