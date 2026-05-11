import { prisma } from '../utils/prisma';
import { catchAsync } from '../utils/catchAsync';

export const healthCheck = catchAsync(async (req, res, next) => {
  await prisma.$queryRaw`SELECT 1`;
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    database: 'connected',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});
