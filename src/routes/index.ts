import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';
import authRoutes from './auth.routes';
import postRoutes from './post.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health Check
router.get('/health', healthCheck);

// Auth
router.use('/auth', authRoutes);

// Admin
router.use('/admin', adminRoutes);

// Users
router.use('/users', userRoutes);


// Posts
router.use('/posts', postRoutes);


export default router;

