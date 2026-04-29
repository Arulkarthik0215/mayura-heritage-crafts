import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { customerAuthMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/customer/orders
 * Get all orders for the logged-in customer
 */
router.get('/', customerAuthMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Fetch customer orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/customer/orders/:id
 * Get details of a specific order for the logged-in customer
 */
router.get('/:id', customerAuthMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const orderId = req.params.id as string;

    if (!customerId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ order });
  } catch (error) {
    console.error('Fetch customer order details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
