import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/testimonials
 * Public — returns all testimonials.
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany();
    res.json({ testimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/testimonials
 * Protected — creates a new testimonial.
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, location, text, rating } = req.body;

    if (!name || !location || !text) {
      res.status(400).json({ error: 'Name, location, and text are required' });
      return;
    }

    const testimonial = await prisma.testimonial.create({
      data: { name, location, text, rating: rating || 5 },
    });

    res.status(201).json({ testimonial });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/testimonials/:id
 * Protected — deletes a testimonial.
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.testimonial.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
