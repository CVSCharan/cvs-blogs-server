import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Wraps an async route handler and forwards any thrown error to next().
 * Eliminates boilerplate try/catch in every controller.
 */
export const catchAsync = (fn: AsyncHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
