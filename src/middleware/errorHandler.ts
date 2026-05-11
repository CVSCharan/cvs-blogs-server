import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

// Handle Prisma unique constraint violation (P2002)
const handlePrismaUniqueConstraint = (err: Prisma.PrismaClientKnownRequestError) => {
  const field = (err.meta?.target as string[])?.join(', ') || 'field';
  return new AppError(`A record with that ${field} already exists.`, 409);
};

// Handle Prisma record not found (P2025)
const handlePrismaNotFound = () =>
  new AppError('No record found with that identifier.', 404);

// Handle Prisma foreign key constraint violation (P2003)
const handlePrismaForeignKey = () =>
  new AppError('Related record does not exist. Check your foreign key references.', 400);

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Never leak programmer/unexpected errors to clients
    logger.error('UNEXPECTED ERROR 💥', { error: err });
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Always log errors with request context
  logger.error(`${req.method} ${req.originalUrl} → ${err.message}`, {
    statusCode: err.statusCode,
    stack: err.stack,
    ip: req.ip,
  });

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') error = handlePrismaUniqueConstraint(err);
      if (err.code === 'P2025') error = handlePrismaNotFound();
      if (err.code === 'P2003') error = handlePrismaForeignKey();
    }

    sendErrorProd(error, res);
  }
};
