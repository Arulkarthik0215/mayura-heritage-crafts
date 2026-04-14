import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/categories
 * Public — returns all categories.
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany();
    res.json({ categories });
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

export default router;
