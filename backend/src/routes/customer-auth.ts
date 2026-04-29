import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../lib/prisma';
import { customerAuthMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mayura-heritage-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/customer/auth/register
 * Standard email/password registration
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const existingUser = await prisma.customer.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone || null,
      },
    });

    const token = jwt.sign({ id: customer.id, email: customer.email, role: 'customer' }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });

    res.status(201).json({
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email },
    });
  } catch (error) {
    console.error('Customer register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/customer/auth/login
 * Standard email/password login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    
    if (!customer || !customer.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ id: customer.id, email: customer.email, role: 'customer' }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });

    res.json({
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email },
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/customer/auth/google
 * Google OAuth Login/Registration
 */
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ error: 'Google credential is required' });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Invalid Google token payload' });
      return;
    }

    const { email, name, sub: googleId } = payload;

    // Find existing customer by email (supports account linking)
    let customer = await prisma.customer.findUnique({ where: { email } });

    if (customer) {
      // If customer exists but googleId is not set, link it
      if (!customer.googleId) {
        customer = await prisma.customer.update({
          where: { email },
          data: { googleId },
        });
      }
    } else {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          email,
          name: name || 'Google User',
          googleId,
        },
      });
    }

    const token = jwt.sign({ id: customer.id, email: customer.email, role: 'customer' }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });

    res.json({
      token,
      customer: { id: customer.id, name: customer.name, email: customer.email },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Internal server error during Google Auth' });
  }
});

/**
 * GET /api/customer/auth/me
 * Get current customer profile
 */
router.get('/me', customerAuthMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        createdAt: true,
      },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json({ customer });
  } catch (error) {
    console.error('Customer me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
