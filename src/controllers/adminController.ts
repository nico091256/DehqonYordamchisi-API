import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

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
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    
    const topProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { orders: { _count: 'desc' } },
      include: { _count: { select: { orders: true } } }
    });

    const regionalActivity = await prisma.product.groupBy({
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
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};

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
export const manageUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { action, role } = req.body;

  if (typeof id !== 'string') return res.status(400).json({ message: 'Invalid ID' });

  try {
    if (action === 'DELETE') {
      await prisma.user.delete({ where: { id } });
      return res.json({ message: 'User deleted' });
    }
    
    if (action === 'BLOCK') {
      await prisma.user.update({ where: { id }, data: { isBlocked: true } });
      return res.json({ message: 'User blocked' });
    }
    
    if (action === 'UNBLOCK') {
      await prisma.user.update({ where: { id }, data: { isBlocked: false } });
      return res.json({ message: 'User unblocked' });
    }

    if (action === 'CHANGE_ROLE') {
      await prisma.user.update({ where: { id }, data: { role } });
      return res.json({ message: `User role changed to ${role}` });
    }

    res.status(400).json({ message: 'Invalid action' });
  } catch (error) {
    res.status(500).json({ message: 'Error managing user', error });
  }
};

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
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, phone: true, role: true, region: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};
