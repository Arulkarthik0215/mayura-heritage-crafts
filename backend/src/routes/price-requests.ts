import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { sendPriceRequestNotification } from '../lib/mailer';

const router = Router();

/**
 * POST /api/price-requests
 * Public — submit a price request for a product.
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, productName, name, email, phone } = req.body;

    if (!productId || !productName || !name || !email || !phone) {
      res.status(400).json({ error: 'All fields are required: productId, productName, name, email, phone' });
      return;
    }

    const priceRequest = await prisma.priceRequest.create({
      data: {
        productId,
        productName,
        name,
        email,
        phone,
      },
    });

    // Send email notification to admin (non-blocking)
    sendPriceRequestNotification({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      productName,
      productId,
    }).catch((err) => console.error('Email notification error:', err));

    res.status(201).json({ priceRequest });
  } catch (error) {
    console.error('Create price request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/price-requests
 * Protected — list all price requests (admin).
 */
router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const priceRequests = await prisma.priceRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ priceRequests });
  } catch (error) {
    console.error('Get price requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/price-requests/:id
 * Protected — update price request status (admin).
 */
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const existing = await prisma.priceRequest.findUnique({ where: { id: req.params.id as string } });
    if (!existing) {
      res.status(404).json({ error: 'Price request not found' });
      return;
    }

    const priceRequest = await prisma.priceRequest.update({
      where: { id: req.params.id as string },
      data: {
        ...(status && { status }),
      },
    });

    res.json({ priceRequest });
  } catch (error) {
    console.error('Update price request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/price-requests/:id
 * Protected — delete a price request (admin).
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.priceRequest.findUnique({ where: { id: req.params.id as string } });
    if (!existing) {
      res.status(404).json({ error: 'Price request not found' });
      return;
    }

    await prisma.priceRequest.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Price request deleted successfully' });
  } catch (error) {
    console.error('Delete price request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
