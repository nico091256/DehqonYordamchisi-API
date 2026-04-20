import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * @openapi
 * /api/favorites/toggle:
 *   post:
 *     tags: [Favorites]
 *     summary: Toggle product in favorites
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
 *       200:
 *         description: Toggled successfully
 */
export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  const { productId } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
      return res.json({ message: 'Removed from favorites' });
    } else {
      await prisma.favorite.create({
        data: { userId, productId }
      });
      return res.json({ message: 'Added to favorites' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling favorite', error });
  }
};

/**
 * @openapi
 * /api/favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: Get user favorites
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
export const getMyFavorites = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            farmer: { select: { name: true, phone: true } }
          }
        }
      }
    });
    res.json(favorites.map(f => f.product));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error });
  }
};
