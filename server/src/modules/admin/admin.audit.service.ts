import { prisma } from '../../infrastructure/database/prisma';
import { CustomerDto } from '../../../../shared/contracts/auth/auth.dto';
import { AdminAuditLogDto } from '../../../../shared/contracts/admin/admin.dto';

export interface RecordAuditParams {
  actor: CustomerDto;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: any;
}

export class AdminAuditService {
  async record(params: RecordAuditParams, tx?: any): Promise<void> {
    const db = tx || prisma;
    try {
      await db.adminAuditLog.create({
        data: {
          actorId: params.actor.id,
          actorEmail: params.actor.email,
          actorRole: params.actor.role,
          action: params.action,
          targetType: params.targetType,
          targetId: params.targetId,
          metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined
        }
      });
    } catch (err: any) {
      console.error('Failed to record admin audit log:', err.message);
      // Audit failure shouldn't necessarily crash the whole domain operation unless in critical mode
    }
  }

  async getRecentLogs(limit: number = 100, filter?: { action?: string; targetType?: string; actorId?: string }): Promise<AdminAuditLogDto[]> {
    const where: any = {};
    if (filter?.action) where.action = filter.action;
    if (filter?.targetType) where.targetType = filter.targetType;
    if (filter?.actorId) where.actorId = filter.actorId;

    const logs = await prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 500)
    });

    return logs.map(l => ({
      id: l.id,
      actorId: l.actorId,
      actorEmail: l.actorEmail,
      actorRole: l.actorRole,
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      metadata: l.metadata,
      createdAt: l.createdAt.toISOString()
    }));
  }
}

export const adminAuditService = new AdminAuditService();
