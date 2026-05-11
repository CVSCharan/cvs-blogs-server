import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404));
};
