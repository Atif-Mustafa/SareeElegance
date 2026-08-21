import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { CustomerDto } from '../../../../shared/contracts/auth/auth.dto';
import { AdminReturnListItemDto } from '../../../../shared/contracts/admin/admin.dto';
import { returnsService } from '../returns/returns.service';
import { adminAuditService } from './admin.audit.service';
import { AdminReturnInspectInput } from '../../../../shared/schemas/admin';

export class AdminReturnsService {
  async getReturns(query?: { status?: string; refundStatus?: string; search?: string; page?: number; limit?: number }): Promise<{
    returns: AdminReturnListItemDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.refundStatus) where.refundStatus = query.refundStatus;
    if (query?.search) {
      where.OR = [
        { id: { contains: query.search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    const [returns, total] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        include: {
          order: {
            select: { id: true, orderNumber: true, email: true, currency: true }
          },
          lines: {
            include: {
              orderLine: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.returnRequest.count({ where })
    ]);

    const mapped = returns.map(r => ({
      id: r.id,
      orderId: r.orderId,
      orderNumber: r.order.orderNumber,
      status: r.status,
      refundStatus: r.refundStatus,
      refundAmount: r.refundAmountMinor ? {
        amountMinor: r.refundAmountMinor.toString(),
        currency: r.order.currency
      } : null,
      reason: r.reason,
      linesCount: r.lines.reduce((sum, l) => sum + l.quantity, 0),
      createdAt: r.createdAt.toISOString(),
      lines: r.lines.map(l => ({
        id: l.id,
        orderLineId: l.orderLineId,
        productName: l.orderLine.name,
        quantity: l.quantity,
        reason: l.reason,
        disposition: l.disposition as any
      }))
    }));

    return {
      returns: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  async getReturnById(id: string) {
    const returnReq = await prisma.returnRequest.findUnique({
      where: { id },
      include: {
        order: {
          include: { lines: true, shipment: true }
        },
        lines: {
          include: { orderLine: true }
        }
      }
    });

    if (!returnReq) {
      throw ApiError.notFound('Return request not found');
    }

    return {
      id: returnReq.id,
      orderId: returnReq.orderId,
      orderNumber: returnReq.order.orderNumber,
      orderStatus: returnReq.order.status,
      customerEmail: returnReq.order.email,
      status: returnReq.status,
      refundStatus: returnReq.refundStatus,
      refundAmountMinor: returnReq.refundAmountMinor?.toString() || null,
      currency: returnReq.order.currency,
      reason: returnReq.reason,
      providerRefundId: returnReq.providerRefundId,
      createdAt: returnReq.createdAt.toISOString(),
      lines: returnReq.lines.map(l => ({
        id: l.id,
        orderLineId: l.orderLineId,
        productName: l.orderLine.name,
        sku: l.orderLine.sku,
        quantity: l.quantity,
        unitPriceMinor: l.orderLine.unitPriceMinor.toString(),
        reason: l.reason,
        disposition: l.disposition
      }))
    };
  }

  async approveReturn(actor: CustomerDto, id: string) {
    await returnsService.approveReturn(id);

    await adminAuditService.record({
      actor,
      action: 'RETURN_APPROVE',
      targetType: 'RETURN',
      targetId: id
    });

    return { success: true, message: 'Return approved' };
  }

  async rejectReturn(actor: CustomerDto, id: string, reason: string) {
    const updated = await prisma.$transaction(async (tx) => {
      const returnReq = await tx.returnRequest.findUnique({ where: { id } });
      if (!returnReq) throw ApiError.notFound('Return request not found');
      if (returnReq.status === 'REJECTED' || returnReq.status === 'CLOSED') {
        throw ApiError.badRequest(`Return is already in ${returnReq.status} state`);
      }

      const res = await tx.returnRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reason: `${returnReq.reason} | Rejected: ${reason}`
        }
      });

      await adminAuditService.record({
        actor,
        action: 'RETURN_REJECT',
        targetType: 'RETURN',
        targetId: id,
        metadata: { reason }
      }, tx);

      return res;
    });

    return { success: true, return: updated };
  }

  async inspectReturn(actor: CustomerDto, id: string, input: AdminReturnInspectInput) {
    await returnsService.processInspection(id, input.dispositions);

    await adminAuditService.record({
      actor,
      action: 'RETURN_INSPECT',
      targetType: 'RETURN',
      targetId: id,
      metadata: { dispositions: input.dispositions }
    });

    return { success: true, message: 'Inspection completed' };
  }

  async issueRefund(actor: CustomerDto, id: string) {
    await returnsService.issueRefund(id);

    await adminAuditService.record({
      actor,
      action: 'RETURN_REFUND',
      targetType: 'RETURN',
      targetId: id
    });

    return { success: true, message: 'Refund initiated' };
  }
}

export const adminReturnsService = new AdminReturnsService();
