"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
const getProfile = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, phone: true, role: true, region: true, image: true, createdAt: true }
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
};
exports.getProfile = getProfile;
/**
 * @openapi
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: 'string' }
 *               region: { type: 'string' }
 *               image: { type: 'string', nullable: true }
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */
const updateProfile = async (req, res) => {
    const userId = req.user?.id;
    const { name, region, image } = req.body;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: { name, region, image },
            select: { id: true, name: true, phone: true, role: true, region: true, image: true }
        });
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};
exports.updateProfile = updateProfile;
/**
 * @openapi
 * /api/users/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: 'string' }
 *               newPassword: { type: 'string' }
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Incorrect current password
 */
const changePassword = async (req, res) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    if (!userId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Current password is incorrect' });
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating password', error });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=userController.js.map