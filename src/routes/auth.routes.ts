import { Router } from 'express';
import { register, login, refresh, logout, logoutAll, getMe } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { registerSchema, loginSchema } from '../validators/schemas';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply auth specific rate limiting
router.use(authLimiter);

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);        // Uses HttpOnly cookie — no body needed
router.post('/logout', logout);          // Works even if not authenticated

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout-all', protect, logoutAll);

export default router;
