import { Router } from 'express';
import { toggleFavorite, getMyFavorites } from '../controllers/favoriteController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/toggle', toggleFavorite);
router.get('/', getMyFavorites);

export default router;
