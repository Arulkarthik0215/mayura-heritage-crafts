import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/products
 * Public — returns all products. Supports optional query params:
 *   ?category=golu&featured=true&search=ganesha
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, featured, search } = req.query;

    const where: any = {};

    if (category) {
      where.category = category as string;
    }
    if (featured === 'true') {
      where.featured = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/products/:id
 * Public — returns a single product.
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/products
 * Protected — creates a new product.
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, originalPrice, category, images, featured, rating, reviews, inStock, tags } = req.body;

    if (!name || !description || price === undefined || !category) {
      res.status(400).json({ error: 'Name, description, price, and category are required' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category,
        images: images || [],
        featured: featured || false,
        rating: rating ? parseFloat(rating) : 0,
        reviews: reviews ? parseInt(reviews) : 0,
        inStock: inStock !== undefined ? inStock : true,
        tags: tags || [],
      },
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/products/:id
 * Protected — updates an existing product.
 */
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id as string } });

    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const { name, description, price, originalPrice, category, images, featured, rating, reviews, inStock, tags } = req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id as string },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(category !== undefined && { category }),
        ...(images !== undefined && { images }),
        ...(featured !== undefined && { featured }),
        ...(rating !== undefined && { rating: parseFloat(rating) }),
        ...(reviews !== undefined && { reviews: parseInt(reviews) }),
        ...(inStock !== undefined && { inStock }),
        ...(tags !== undefined && { tags }),
      },
    });

    res.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/products/:id
 * Protected — deletes a product.
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id as string } });

    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    await prisma.product.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
