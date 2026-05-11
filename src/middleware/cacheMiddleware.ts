import { Request, Response, NextFunction } from 'express';
import * as cache from '../utils/cache';

export const cacheMiddleware = (ttl: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    // Modify res.json to store the response in cache before sending
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode === 200 && body.status === 'success') {
        cache.set(key, body, ttl);
      }
      return originalJson.call(this, body);
    };

    next();
  };
};
