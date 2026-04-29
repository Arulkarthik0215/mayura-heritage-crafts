import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env vars before anything else
dotenv.config();

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import testimonialRoutes from './routes/testimonials';
import uploadRoutes from './routes/upload';
import settingsRoutes from './routes/settings';
import orderRoutes from './routes/orders';
import customerAuthRoutes from './routes/customer-auth';
import customerOrdersRoutes from './routes/customer-orders';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customer/auth', customerAuthRoutes);
app.use('/api/customer/orders', customerOrdersRoutes);

// Start server
app.listen(port, () => {
  console.log(`🚀 Mayura Heritage Crafts API running on http://localhost:${port}`);
  console.log(`   Health check: http://localhost:${port}/api/health`);
});

export default app;
