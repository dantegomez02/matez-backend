import { Router } from 'express';
import productRoutes from './productRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/products', productRoutes);
router.use('/auth', authRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Matez Junín API (Layered Architecture)'
  });
});

export default router;
