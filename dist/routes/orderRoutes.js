"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.post('/', (0, authMiddleware_1.authorize)(['BUYER']), orderController_1.createOrder);
router.patch('/:id/status', (0, authMiddleware_1.authorize)(['FARMER']), orderController_1.updateOrderStatus);
router.get('/my', orderController_1.getMyOrders);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map