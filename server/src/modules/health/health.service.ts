import { prisma } from '../../infrastructure/database/prisma';

export class HealthService {
  /**
   * Checks the connectivity to the database by executing a simple query.
   * Does not rely on any domain models.
   *
   * @returns true if connected successfully, false otherwise.
   */
  static async checkDatabaseConnectivity(): Promise<boolean> {
    try {
      // Smallest safe query to verify connection
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database readiness check failed:', error);
      return false;
    }
  }
}
