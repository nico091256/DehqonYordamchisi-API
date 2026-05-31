import { Router } from 'express';
import { chatWithAI } from '../controllers/aiController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/chat', chatWithAI);

export default router;
