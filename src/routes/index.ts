import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';
import authRoutes from './auth.routes';
import postRoutes from './post.routes';

const router = Router();

// Health Check
router.get('/health', healthCheck);

// Auth
router.use('/auth', authRoutes);

// Posts
router.use('/posts', postRoutes);

export default router;

