"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyOrders = exports.updateOrderStatus = exports.createOrder = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order (Buyer only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: 'string' }
 *     responses:
 *       201:
 *         description: Order created
 *       401:
 *         description: Unauthorized
 */
const createOrder = async (req, res) => {
    const { productId } = req.body;
    const buyerId = req.user?.id;
    if (!buyerId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const order = await prisma_1.default.order.create({
            data: {
                productId,
                buyerId,
                status: 'PENDING',
            },
        });
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
};
exports.createOrder = createOrder;
/**
 * @openapi
 * /api/orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status (Farmer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: 'string', enum: [ACCEPTED, REJECTED] }
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Forbidden
 */
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;
    if (!userId || typeof id !== 'string')
        return res.status(401).json({ message: 'Unauthorized or invalid ID' });
    try {
        const order = await prisma_1.default.order.findUnique({
            where: { id },
            include: { product: true },
        }); // Cast to any to bypass relation type inference issues in this environment
        if (!order)
            return res.status(404).json({ message: 'Order not found' });
        if (order.product.farmerId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const updatedOrder = await prisma_1.default.order.update({
            where: { id },
            data: { status },
        });
        res.json(updatedOrder);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating order', error });
    }
};
exports.updateOrderStatus = updateOrderStatus;
/**
 * @openapi
 * /api/orders/my-orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders for the current user (Buyer or Farmer)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
const getMyOrders = async (req, res) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        let orders;
        if (role === 'BUYER') {
            orders = await prisma_1.default.order.findMany({
                where: { buyerId: userId },
                include: { product: true },
            });
        }
        else if (role === 'FARMER') {
            orders = await prisma_1.default.order.findMany({
                where: { product: { farmerId: userId } },
                include: { product: true, buyer: { select: { name: true, phone: true } } },
            });
        }
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};
exports.getMyOrders = getMyOrders;
//# sourceMappingURL=orderController.js.map