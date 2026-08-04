import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/jobnet?schema=public";
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const pool = new Pool({ connectionString, max: 10, connectionTimeoutMillis: 2000 });
  const adapter = new PrismaPg(pool as any);
  
  return new PrismaClient({
    adapter: adapter as any,
    log: [],
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Safely executes database operations with fallback for when PostgreSQL daemon is offline or disconnected.
 * This guarantees resilience and offline dev capability without crashing the UI.
 */
export async function withDbFallback<T>(
  queryFn: (db: PrismaClient) => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    return await queryFn(prisma);
  } catch (error) {
    console.warn('[Database Graceful Fallback] Database query failed or PostgreSQL is unreachable:', (error as Error)?.message?.slice(0, 100));
    return fallbackValue;
  }
}
