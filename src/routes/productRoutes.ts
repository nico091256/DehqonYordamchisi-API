import { Router } from 'express';
import { createProduct, getProducts, getProductById, deleteProduct, updateProduct, getFarmerStats } from '../controllers/productController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { productValidator } from '../utils/validators';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.get('/', getProducts);
router.get('/farmer/stats', authenticate, authorize(['FARMER']), getFarmerStats);
router.get('/:id', getProductById);
router.post('/', authenticate, authorize(['FARMER']), productValidator, validateRequest, createProduct);
router.put('/:id', authenticate, authorize(['FARMER']), productValidator, validateRequest, updateProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;
