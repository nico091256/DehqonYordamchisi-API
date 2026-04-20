"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.manageUser = exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers: { type: 'number' }
 *                 totalProducts: { type: 'number' }
 *                 totalOrders: { type: 'number' }
 *                 topProducts:
 *                   type: 'array'
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 regionalActivity:
 *                   type: 'array'
 *                   items:
 *                     type: 'object'
 *                     properties:
 *                       region: { type: 'string' }
 *                       _count: { type: 'number' }
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await prisma_1.default.user.count();
        const totalProducts = await prisma_1.default.product.count();
        const totalOrders = await prisma_1.default.order.count();
        const topProducts = await prisma_1.default.product.findMany({
            take: 5,
            orderBy: { orders: { _count: 'desc' } },
            include: { _count: { select: { orders: true } } }
        });
        const regionalActivity = await prisma_1.default.product.groupBy({
            by: ['region'],
            _count: true,
            orderBy: { _count: { region: 'desc' } }
        });
        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            topProducts,
            regionalActivity
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error });
    }
};
exports.getDashboardStats = getDashboardStats;
/**
 * @openapi
 * /api/admin/manage-user/{id}:
 *   post:
 *     tags: [Admin]
 *     summary: Manage a user (BLOCK, UNBLOCK, DELETE, CHANGE_ROLE)
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
 *             required: [action]
 *             properties:
 *               action: { type: 'string', enum: ['BLOCK', 'UNBLOCK', 'DELETE', 'CHANGE_ROLE'] }
 *               role: { type: 'string', enum: ['FARMER', 'BUYER', 'ADMIN'] }
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid action
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const manageUser = async (req, res) => {
    const { id } = req.params;
    const { action, role } = req.body;
    if (typeof id !== 'string')
        return res.status(400).json({ message: 'Invalid ID' });
    try {
        if (action === 'DELETE') {
            await prisma_1.default.user.delete({ where: { id } });
            return res.json({ message: 'User deleted' });
        }
        if (action === 'BLOCK') {
            await prisma_1.default.user.update({ where: { id }, data: { isBlocked: true } });
            return res.json({ message: 'User blocked' });
        }
        if (action === 'UNBLOCK') {
            await prisma_1.default.user.update({ where: { id }, data: { isBlocked: false } });
            return res.json({ message: 'User unblocked' });
        }
        if (action === 'CHANGE_ROLE') {
            await prisma_1.default.user.update({ where: { id }, data: { role } });
            return res.json({ message: `User role changed to ${role}` });
        }
        res.status(400).json({ message: 'Invalid action' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error managing user', error });
    }
};
exports.manageUser = manageUser;
/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: { id: true, name: true, phone: true, role: true, region: true, createdAt: true }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};
exports.getAllUsers = getAllUsers;
//# sourceMappingURL=adminController.js.map