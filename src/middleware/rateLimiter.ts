import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes) for auth routes
  message: 'Too many attempts from this IP, please try again after 15 minutes',
  handler: (req, res, next) => {
    next(new AppError('Too many attempts from this IP, please try again after 15 minutes', 429));
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: 'Too many requests from this IP, please try again after a minute',
  handler: (req, res, next) => {
    next(new AppError('Too many requests from this IP, please try again after a minute', 429));
  },
  standardHeaders: true,
  legacyHeaders: false,
});
