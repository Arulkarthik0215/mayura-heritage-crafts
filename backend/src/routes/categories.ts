import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/categories
 * Public — returns all categories with their subcategories.
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [categories, subCategories] = await Promise.all([
      prisma.category.findMany(),
      prisma.subCategory.findMany({ orderBy: { name: 'asc' } }),
    ]);

    // Attach subcategories to each category
    const categoriesWithSubs = categories.map((cat) => ({
      ...cat,
      subCategories: subCategories.filter((sc) => sc.parentSlug === cat.slug),
    }));

    res.json({ categories: categoriesWithSubs });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/categories
 * Protected — creates a new category.
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug, name, description, icon } = req.body;

    if (!slug || !name || !description || !icon) {
      res.status(400).json({ error: 'All fields (slug, name, description, icon) are required' });
      return;
    }

    const category = await prisma.category.create({
      data: { slug, name, description, icon },
    });

    res.status(201).json({ category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/categories/:id
 * Protected — updates a category.
 */
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug, name, description, icon } = req.body;

    const category = await prisma.category.update({
      where: { id: req.params.id as string },
      data: {
        ...(slug !== undefined && { slug }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
      },
    });

    res.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/categories/:id
 * Protected — deletes a category.
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.category.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ─── Subcategory Routes ─── */

/**
 * GET /api/categories/:slug/subcategories
 * Public — returns subcategories for a parent category.
 */
router.get('/:slug/subcategories', async (req: Request, res: Response): Promise<void> => {
  try {
    const subCategories = await prisma.subCategory.findMany({
      where: { parentSlug: req.params.slug as string },
      orderBy: { name: 'asc' },
    });
    res.json({ subCategories });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/categories/:slug/subcategories
 * Protected — creates a subcategory under a parent category.
 */
router.post('/:slug/subcategories', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug: subSlug, name, description } = req.body;
    const parentSlug = req.params.slug as string;

    if (!subSlug || !name) {
      res.status(400).json({ error: 'Slug and name are required' });
      return;
    }

    // Verify parent category exists
    const parent = await prisma.category.findFirst({ where: { slug: parentSlug } });
    if (!parent) {
      res.status(404).json({ error: 'Parent category not found' });
      return;
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        slug: subSlug,
        name,
        description: description || '',
        parentSlug,
      },
    });

    res.status(201).json({ subCategory });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'A subcategory with this slug already exists' });
      return;
    }
    console.error('Create subcategory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/categories/subcategories/:id
 * Protected — updates a subcategory.
 */
router.put('/subcategories/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug, name, description } = req.body;

    const subCategory = await prisma.subCategory.update({
      where: { id: req.params.id as string },
      data: {
        ...(slug !== undefined && { slug }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });

    res.json({ subCategory });
  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/categories/subcategories/:id
 * Protected — deletes a subcategory.
 */
router.delete('/subcategories/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.subCategory.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
