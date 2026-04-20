import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { registerValidator, loginValidator } from '../utils/validators';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);

export default router;
