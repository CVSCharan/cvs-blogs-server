import 'dotenv/config';
import app from './app';
import { prisma } from './utils/prisma';
import logger from './utils/logger';

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
    });

    // Graceful shutdown on SIGTERM (e.g. Fly.io, Railway, Render)
    const shutdown = async (signal: string) => {
      logger.warn(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server closed. Database disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Failed to start server', { error });
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
