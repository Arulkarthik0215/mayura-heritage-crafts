import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// ── Razorpay instance ──
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// ── Helpers ──
function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `MHC-${y}${m}${d}-${rand}`;
}

const DOMESTIC_FREE_THRESHOLD = 99900; // ₹999 in paise
const DOMESTIC_SHIPPING = 9900;        // ₹99 in paise
const INTERNATIONAL_SHIPPING = 149900; // ₹1499 in paise

function calcShipping(subtotalPaise: number, country: string): number {
  if (country !== 'India') return INTERNATIONAL_SHIPPING;
  return subtotalPaise >= DOMESTIC_FREE_THRESHOLD ? 0 : DOMESTIC_SHIPPING;
}

// ───────────────────────────────────────────
// POST /api/orders — create a new order + Razorpay order
// ───────────────────────────────────────────
interface CartItem {
  productId: string;
  quantity: number;
}

router.post('/', optionalAuthMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      items,
    } = req.body as {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      items: CartItem[];
    };

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !addressLine1 || !city || !state || !postalCode || !country) {
      res.status(400).json({ error: 'All address fields are required' });
      return;
    }
    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Fetch real prices from DB — never trust the client
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      res.status(400).json({ error: 'One or more products not found' });
      return;
    }

    // Build order items with server-side pricing
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || null,
        price: Math.round(product.price * 100), // convert ₹ to paise
        quantity: item.quantity,
      };
    });

    const subtotalPaise = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingPaise = calcShipping(subtotalPaise, country);
    const totalPaise = subtotalPaise + shippingPaise;

    const orderNumber = generateOrderNumber();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: { customerEmail, customerName },
    });

    // Save to database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        postalCode,
        country,
        subtotal: subtotalPaise,
        shippingCharge: shippingPaise,
        totalAmount: totalPaise,
        razorpayOrderId: razorpayOrder.id,
        customerId: req.user?.role === 'customer' ? req.user.id : null,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    res.status(201).json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        razorpayOrderId: razorpayOrder.id,
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ───────────────────────────────────────────
// POST /api/orders/verify — verify Razorpay payment
// ───────────────────────────────────────────
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: 'Missing payment verification fields' });
      return;
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ error: 'Payment verification failed — invalid signature' });
      return;
    }

    // Update order in DB
    const order = await prisma.order.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        status: 'PAID',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date(),
      },
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// ───────────────────────────────────────────
// POST /api/orders/track — public tracking
// ───────────────────────────────────────────
router.post('/track', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumber, email } = req.body;

    if (!orderNumber || !email) {
      res.status(400).json({ error: 'Order Number and Email are required' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order || order.customerEmail !== email) {
      res.status(404).json({ error: 'Order not found or email does not match' });
      return;
    }

    res.json({ order });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ───────────────────────────────────────────
// GET /api/orders/admin — list all orders (admin)
// ───────────────────────────────────────────
router.get('/admin', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ───────────────────────────────────────────
// GET /api/orders/admin/stats — order statistics
// ───────────────────────────────────────────
router.get('/admin/stats', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalOrders, paidOrders, allOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { not: 'PENDING' } } }),
      prisma.order.findMany({ where: { status: { not: 'PENDING' } }, select: { totalAmount: true } }),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({ totalOrders, paidOrders, totalRevenue });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ───────────────────────────────────────────
// PUT /api/orders/admin/:id — update order status (admin)
// ───────────────────────────────────────────
router.put('/admin/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const existing = await prisma.order.findUnique({ where: { id: req.params.id as string } });
    if (!existing) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const order = await prisma.order.update({
      where: { id: req.params.id as string },
      data: {
        ...(status && { status }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(notes !== undefined && { notes }),
      },
      include: { items: true },
    });

    res.json({ order });
  } catch (error) {
    console.error('Admin update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
