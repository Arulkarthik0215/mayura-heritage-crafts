import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/products
 * Public — returns all products. Supports optional query params:
 *   ?category=golu&subCategory=brass-lamps&featured=true&search=ganesha
 *   &minPrice=100&maxPrice=5000&inStock=true&priceType=priced|request
 *   &minRating=4&tags=bestseller,premium
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, subCategory, featured, search, minPrice, maxPrice, inStock, priceType, minRating, tags } = req.query;

    const where: any = {};

    if (category) {
      where.category = category as string;
    }
    if (subCategory) {
      where.subCategory = subCategory as string;
    }
    if (featured === 'true') {
      where.featured = true;
    }
    if (inStock === 'true') {
      where.inStock = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Price type filter: "priced" = has a price, "request" = price is null
    if (priceType === 'priced') {
      where.price = { not: null };
    } else if (priceType === 'request') {
      where.price = null;
    }

    // Price range (only applies to products that have a price)
    if (minPrice || maxPrice) {
      where.price = {
        ...(where.price || {}),
        ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {}),
      };
    }

    // Minimum rating filter
    if (minRating) {
      where.rating = { gte: parseFloat(minRating as string) };
    }

    // Tags filter (comma-separated, match any)
    if (tags) {
      const tagList = (tags as string).split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        where.tags = { hasSome: tagList };
      }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
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
    const { name, description, price, originalPrice, category, subCategory, images, featured, rating, reviews, inStock, tags, hasCustomShipping, shippingChargeIndia, shippingChargeForeign, displayOrder } = req.body;

    if (!name || !description || !category) {
      res.status(400).json({ error: 'Name, description, and category are required' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: price !== undefined && price !== null && price !== '' ? parseFloat(price) : null,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category,
        subCategory: subCategory || null,
        images: images || [],
        featured: featured || false,
        rating: rating ? parseFloat(rating) : 0,
        reviews: reviews ? parseInt(reviews) : 0,
        inStock: inStock !== undefined ? inStock : true,
        tags: tags || [],
        hasCustomShipping: hasCustomShipping || false,
        shippingChargeIndia: shippingChargeIndia !== undefined && shippingChargeIndia !== null && shippingChargeIndia !== '' ? parseFloat(shippingChargeIndia) : null,
        shippingChargeForeign: shippingChargeForeign !== undefined && shippingChargeForeign !== null && shippingChargeForeign !== '' ? parseFloat(shippingChargeForeign) : null,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : 0,
      },
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/products/reorder
 * Protected — batch updates displayOrder for multiple products.
 */
router.put('/reorder', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'items must be an array of { id, displayOrder }' });
      return;
    }

    const updates = items.map((item) =>
      prisma.product.update({
        where: { id: item.id },
        data: { displayOrder: parseInt(String(item.displayOrder)) || 0 },
      })
    );

    await prisma.$transaction(updates);

    res.json({ message: 'Products reordered successfully' });
  } catch (error) {
    console.error('Reorder products error:', error);
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

    const { name, description, price, originalPrice, category, subCategory, images, featured, rating, reviews, inStock, tags, hasCustomShipping, shippingChargeIndia, shippingChargeForeign, displayOrder } = req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id as string },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: price !== null && price !== '' ? parseFloat(price) : null }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(category !== undefined && { category }),
        ...(subCategory !== undefined && { subCategory: subCategory || null }),
        ...(images !== undefined && { images }),
        ...(featured !== undefined && { featured }),
        ...(rating !== undefined && { rating: parseFloat(rating) }),
        ...(reviews !== undefined && { reviews: parseInt(reviews) }),
        ...(inStock !== undefined && { inStock }),
        ...(tags !== undefined && { tags }),
        ...(hasCustomShipping !== undefined && { hasCustomShipping }),
        ...(shippingChargeIndia !== undefined && { shippingChargeIndia: shippingChargeIndia !== null && shippingChargeIndia !== '' ? parseFloat(shippingChargeIndia) : null }),
        ...(shippingChargeForeign !== undefined && { shippingChargeForeign: shippingChargeForeign !== null && shippingChargeForeign !== '' ? parseFloat(shippingChargeForeign) : null }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) }),
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
