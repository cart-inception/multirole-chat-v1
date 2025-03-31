import { Router } from 'express';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';

const router = Router();

// Mount routes at their respective prefixes
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;