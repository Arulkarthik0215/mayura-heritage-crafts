import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mayura-heritage-super-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to protect admin routes.
 * Expects: Authorization: Bearer <token>
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
}

/**
 * Middleware to protect customer routes.
 * Expects: Authorization: Bearer <token>
 */
export function customerAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    if (decoded.role !== 'customer') {
      res.status(403).json({ error: 'Forbidden: Customer access required' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
}

/**
 * Middleware that allows BOTH admins and customers, or just sets req.user if token exists.
 */
export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = decoded;
  } catch (error) {
    // ignore invalid token for optional auth
  }
  next();
}
