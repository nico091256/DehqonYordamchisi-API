import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

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
export const createProduct = async (req: AuthRequest, res: Response) => {
  const { title, price, quantity, region, image, category } = req.body;
  const farmerId = req.user?.id;

  if (!farmerId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const product = await prisma.product.create({
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
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

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
export const getProducts = async (req: Request, res: Response) => {
  const { region, minPrice, maxPrice, search, category, page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  try {
    const where: any = {
      region: region ? String(region) : undefined,
      category: category ? (String(category) as any) : undefined,
      price: {
        gte: minPrice ? parseFloat(String(minPrice)) : undefined,
        lte: maxPrice ? parseFloat(String(maxPrice)) : undefined,
      },
      title: search ? { contains: String(search), mode: 'insensitive' } : undefined,
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
      prisma.product.count({ where }),
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
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

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
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== 'string') return res.status(400).json({ message: 'Invalid ID' });

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        farmer: {
          select: { name: true, phone: true, region: true },
        },
      },
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

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
export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, price, quantity, region, image } = req.body;
  const farmerId = req.user?.id;

  if (typeof id !== 'string') return res.status(400).json({ message: 'Invalid ID' });

  try {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.farmerId !== farmerId) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own products' });
    }

    const updatedProduct = await prisma.product.update({
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
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

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
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const farmerId = req.user?.id;

  if (typeof id !== 'string') return res.status(400).json({ message: 'Invalid ID' });

  try {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.farmerId !== farmerId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

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
export const getFarmerStats = async (req: AuthRequest, res: Response) => {
  const farmerId = req.user?.id;

  if (!farmerId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const productCount = await prisma.product.count({ where: { farmerId } });
    
    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      where: { product: { farmerId } },
      _count: true,
    });

    res.json({
      productCount,
      orderStats: orderStats.reduce((acc: any, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, { PENDING: 0, ACCEPTED: 0, REJECTED: 0 })
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching farmer stats', error });
  }
};
