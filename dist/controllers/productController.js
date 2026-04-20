"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFarmerStats = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * @openapi
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product (Farmer only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, price, quantity, region, category]
 *             properties:
 *               title: { type: 'string' }
 *               price: { type: 'number' }
 *               quantity: { type: 'number' }
 *               region: { type: 'string' }
 *               category: { $ref: '#/components/schemas/Category' }
 *               image: { type: 'string' }
 *     responses:
 *       201:
 *         description: Product created
 *       401:
 *         description: Unauthorized
 */
const createProduct = async (req, res) => {
    const { title, price, quantity, region, image, category } = req.body;
    const farmerId = req.user?.id;
    if (!farmerId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const product = await prisma_1.default.product.create({
            data: {
                title,
                price: parseFloat(price),
                quantity: parseFloat(quantity),
                region,
                image,
                category,
                farmerId,
            },
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
};
exports.createProduct = createProduct;
/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products with filters
 *     parameters:
 *       - in: query
 *         name: region
 *         schema: { type: 'string' }
 *       - in: query
 *         name: category
 *         schema: { type: 'string' }
 *       - in: query
 *         name: minPrice
 *         schema: { type: 'number' }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: 'number' }
 *       - in: query
 *         name: search
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: Success
 */
const getProducts = async (req, res) => {
    const { region, minPrice, maxPrice, search, category, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    try {
        const where = {
            region: region ? String(region) : undefined,
            category: category ? String(category) : undefined,
            price: {
                gte: minPrice ? parseFloat(String(minPrice)) : undefined,
                lte: maxPrice ? parseFloat(String(maxPrice)) : undefined,
            },
            title: search ? { contains: String(search), mode: 'insensitive' } : undefined,
        };
        const [products, total] = await Promise.all([
            prisma_1.default.product.findMany({
                where,
                skip,
                take,
                include: {
                    farmer: {
                        select: { name: true, phone: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.product.count({ where }),
        ]);
        res.json({
            products,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};
exports.getProducts = getProducts;
/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
const getProductById = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string')
        return res.status(400).json({ message: 'Invalid ID' });
    try {
        const product = await prisma_1.default.product.findUnique({
            where: { id },
            include: {
                farmer: {
                    select: { name: true, phone: true, region: true },
                },
            },
        });
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
};
exports.getProductById = getProductById;
/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product (Farmer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: Updated
 */
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { title, price, quantity, region, image } = req.body;
    const farmerId = req.user?.id;
    if (typeof id !== 'string')
        return res.status(400).json({ message: 'Invalid ID' });
    try {
        const product = await prisma_1.default.product.findUnique({ where: { id } });
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        if (product.farmerId !== farmerId) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own products' });
        }
        const updatedProduct = await prisma_1.default.product.update({
            where: { id },
            data: {
                title,
                price: price ? parseFloat(price) : undefined,
                quantity: quantity ? parseFloat(quantity) : undefined,
                region,
                image,
            },
        });
        res.json(updatedProduct);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
};
exports.updateProduct = updateProduct;
/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: 'string' }
 *     responses:
 *       200:
 *         description: Deleted
 */
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const farmerId = req.user?.id;
    if (typeof id !== 'string')
        return res.status(400).json({ message: 'Invalid ID' });
    try {
        const product = await prisma_1.default.product.findUnique({ where: { id } });
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        if (product.farmerId !== farmerId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await prisma_1.default.product.delete({ where: { id } });
        res.json({ message: 'Product deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
};
exports.deleteProduct = deleteProduct;
/**
 * @openapi
 * /api/products/farmer/stats:
 *   get:
 *     tags: [Products]
 *     summary: Get farmer dashboard stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
const getFarmerStats = async (req, res) => {
    const farmerId = req.user?.id;
    if (!farmerId)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const productCount = await prisma_1.default.product.count({ where: { farmerId } });
        const orderStats = await prisma_1.default.order.groupBy({
            by: ['status'],
            where: { product: { farmerId } },
            _count: true,
        });
        res.json({
            productCount,
            orderStats: orderStats.reduce((acc, curr) => {
                acc[curr.status] = curr._count;
                return acc;
            }, { PENDING: 0, ACCEPTED: 0, REJECTED: 0 })
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching farmer stats', error });
    }
};
exports.getFarmerStats = getFarmerStats;
//# sourceMappingURL=productController.js.map