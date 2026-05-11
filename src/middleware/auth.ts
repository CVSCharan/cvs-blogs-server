import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

/**
 * protect — verifies the Bearer JWT and attaches `req.user`
 * Use on any route that requires authentication.
 */
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1. Read token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('You are not logged in. Please log in to get access.', 401);
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify token
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');

  const decoded = jwt.verify(token, secret) as JwtPayload;

  // 3. Check user still exists and is not deleted
  const currentUser = await prisma.user.findFirst({
    where: { id: decoded.id, deletedAt: null },
    select: { id: true, email: true, role: true },
  });


  if (!currentUser) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  // 4. Attach user to request
  req.user = currentUser;
  next();
});

/**
 * restrictTo — role-based access control
 * Usage: restrictTo('ADMIN')
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};
