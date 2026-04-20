"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyFavorites = exports.toggleFavorite = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
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
const toggleFavorite = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const existing = await prisma_1.default.favorite.findUnique({
            where: {
                userId_productId: { userId, productId }
            }
        });
        if (existing) {
            await prisma_1.default.favorite.delete({
                where: { id: existing.id }
            });
            return res.json({ message: 'Removed from favorites' });
        }
        else {
            await prisma_1.default.favorite.create({
                data: { userId, productId }
            });
            return res.json({ message: 'Added to favorites' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error toggling favorite', error });
    }
};
exports.toggleFavorite = toggleFavorite;
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
const getMyFavorites = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const favorites = await prisma_1.default.favorite.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching favorites', error });
    }
};
exports.getMyFavorites = getMyFavorites;
//# sourceMappingURL=favoriteController.js.map