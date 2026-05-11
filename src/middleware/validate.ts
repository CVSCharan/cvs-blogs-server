import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError, ZodIssue } from 'zod';
import { AppError } from '../utils/AppError';

/**
 * Middleware factory — validates req.body / req.params / req.query
 * against any Zod schema that has a `body`, `params`, or `query` key.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), authController.register);
 */
export const validate =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.issues
          .map((e: ZodIssue) => `${e.path.slice(1).join('.')}: ${e.message}`)
          .join('; ');
        return next(new AppError(`Validation failed — ${messages}`, 400));
      }
      next(err);
    }
  };
