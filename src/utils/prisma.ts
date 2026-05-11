import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Singleton pattern — prevents multiple PrismaClient instances in development
// (ts-node-dev restarts create fresh modules, but this guards against it)
declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon / other poolers: keep pool small since they handle connection pooling
    max: process.env.NODE_ENV === 'production' ? 10 : 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
  });
};

export const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
