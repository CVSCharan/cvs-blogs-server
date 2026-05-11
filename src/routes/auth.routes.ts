import { Router } from 'express';
import { register, login, refresh, logout, logoutAll, getMe } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { registerSchema, loginSchema } from '../validators/schemas';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply auth specific rate limiting
router.use(authLimiter);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: John Doe }
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: Password123! }
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 */
router.post('/register', validate(registerSchema), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and get tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: Password123! }
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: Contains the refresh_token HttpOnly cookie
 */
router.post('/login', validate(loginSchema), login);

router.post('/refresh', refresh);        // Uses HttpOnly cookie — no body needed
router.post('/logout', logout);          // Works even if not authenticated

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout-all', protect, logoutAll);

export default router;
