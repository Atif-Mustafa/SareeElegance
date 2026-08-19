import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../../config/env';

/**
 * Prisma Client Singleton
 *
 * Ensures only one instance of the Prisma Client is created across the application.
 */
class PrismaService {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      const connectionString = env.DATABASE_URL;
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      PrismaService.instance = new PrismaClient({
        adapter,
        // Disable noisy logs in test environments
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return PrismaService.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
    }
  }
}

export const prisma = PrismaService.getInstance();
export { PrismaService };
