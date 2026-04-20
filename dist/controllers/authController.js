"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../utils/auth");
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone, password, role, region]
 *             properties:
 *               name: { type: 'string' }
 *               phone: { type: 'string' }
 *               password: { type: 'string' }
 *               role: { type: 'string', enum: ['FARMER', 'BUYER', 'ADMIN'] }
 *               region: { type: 'string' }
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: 'string' }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
const register = async (req, res) => {
    const { name, phone, password, role, region } = req.body;
    try {
        const existingUser = await prisma_1.default.user.findUnique({ where: { phone } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this phone already exists' });
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const user = await prisma_1.default.user.create({
            data: {
                name,
                phone,
                password: hashedPassword,
                role,
                region,
            },
        });
        const token = (0, auth_1.generateToken)({ id: user.id, role: user.role });
        res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};
exports.register = register;
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone: { type: 'string' }
 *               password: { type: 'string' }
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: 'string' }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Invalid credentials
 *       403:
 *         description: User blocked
 *       500:
 *         description: Server error
 */
const login = async (req, res) => {
    const { phone, password } = req.body;
    try {
        const user = await prisma_1.default.user.findUnique({ where: { phone } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid phone or password' });
        }
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account is blocked' });
        }
        const isMatch = await (0, auth_1.comparePassword)(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid phone or password' });
        }
        const token = (0, auth_1.generateToken)({ id: user.id, role: user.role });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map