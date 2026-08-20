import { prisma } from '../../infrastructure/database/prisma';
import { ApiError } from '../../common/errors/ApiError';
import { paymentService } from '../payment/payment.service';
import { inventoryService } from '../inventory/inventory.service';
import type { ReturnRequestDto, CreateReturnRequestDto } from '../../../../shared/contracts/returns/return';

export class ReturnsService {
  async createReturnRequest(orderId: string, payload: CreateReturnRequestDto): Promise<ReturnRequestDto> {
    return await prisma.$transaction(async (tx) => {
      // 1. Lock the order to prevent concurrent return/refund processing for the same order
      await tx.$queryRaw`SELECT * FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`;

      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { lines: true, shipment: true }
      });

      if (!order) throw ApiError.notFound('Order not found');
      
      // 2. Validate shipment is DELIVERED
      if (!order.shipment || order.shipment.status !== 'DELIVERED') {
        throw ApiError.badRequest('Return requested on non-delivered order', 'INVALID_RETURN_STATE');
      }

      // Check delivery date (e.g. 14-day window)
      const deliveredAt = order.shipment.deliveredAt;
      if (deliveredAt) {
        const daysSinceDelivery = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDelivery > 14) {
          throw ApiError.badRequest('Return window has expired', 'RETURN_WINDOW_EXPIRED');
        }
      }

      // 3. Validate lines and calculate returnable quantities
      // We must check existing ReturnLines across all non-REJECTED ReturnRequests for this order
      const existingReturnLines = await tx.returnLine.findMany({
        where: {
          orderLine: { orderId: order.id },
          returnRequest: { status: { not: 'REJECTED' } }
        }
      });

      let totalRefundMinor = 0n;

      for (const requestedLine of payload.lines) {
        const orderLine = order.lines.find(l => l.id === requestedLine.orderLineId);
        if (!orderLine) throw ApiError.badRequest(`Order line ${requestedLine.orderLineId} not found`);
        if (requestedLine.quantity <= 0) throw ApiError.badRequest('Quantity must be greater than 0');

        const previouslyReturnedQuantity = existingReturnLines
          .filter(rl => rl.orderLineId === orderLine.id)
          .reduce((sum, rl) => sum + rl.quantity, 0);

        const remainingReturnable = orderLine.quantity - previouslyReturnedQuantity;
        if (requestedLine.quantity > remainingReturnable) {
          throw ApiError.badRequest(`Quantity for item ${orderLine.name} exceeds available returnable quantity`, 'EXCESSIVE_RETURN_QUANTITY');
        }

        // Calculate refund (unitPrice * requestedQuantity)
        totalRefundMinor += (orderLine.unitPriceMinor * BigInt(requestedLine.quantity));
      }

      // 4. Create the return request
      const returnRequest = await tx.returnRequest.create({
        data: {
          orderId: order.id,
          status: 'REQUESTED',
          refundStatus: 'NOT_REQUESTED',
          reason: payload.reason,
          refundAmountMinor: totalRefundMinor,
          lines: {
            create: payload.lines.map(line => ({
              orderLineId: line.orderLineId,
              quantity: line.quantity,
              reason: line.reason || null,
              disposition: 'PENDING'
            }))
          }
        },
        include: { lines: true }
      });

      return this.mapToDto(returnRequest);
    });
  }

  async getReturnRequest(id: string): Promise<ReturnRequestDto> {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id },
      include: { lines: true }
    });
    if (!returnRequest) throw ApiError.notFound('Return request not found');
    return this.mapToDto(returnRequest);
  }

  async getReturnsForOrder(orderId: string): Promise<ReturnRequestDto[]> {
    const returns = await prisma.returnRequest.findMany({
      where: { orderId },
      include: { lines: true }
    });
    return returns.map(this.mapToDto.bind(this));
  }

  // Admin/System operations:
  async approveReturn(returnId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const returnRequest = await tx.returnRequest.findUnique({ where: { id: returnId } });
      if (!returnRequest) throw ApiError.notFound('Return request not found');
      if (returnRequest.status !== 'REQUESTED') throw ApiError.badRequest('Return is not in REQUESTED state');

      await tx.returnRequest.update({
        where: { id: returnId },
        data: { status: 'APPROVED' } // Depending on workflow, might jump to AWAITING_RETURN or process refund immediately
      });
    });
  }

  async issueRefund(returnId: string): Promise<void> {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT * FROM "ReturnRequest" WHERE "id" = ${returnId} FOR UPDATE`;
      
      const returnReq = await tx.returnRequest.findUnique({ 
        where: { id: returnId },
        include: { order: true }
      });
      if (!returnReq) throw ApiError.notFound('Return request not found');
      if (returnReq.refundStatus === 'SUCCEEDED') throw ApiError.badRequest('Refund already succeeded');
      if (returnReq.refundStatus === 'PENDING') throw ApiError.badRequest('Refund is already pending execution');
      
      if (!returnReq.refundAmountMinor) {
        throw ApiError.badRequest('Return has no refund amount calculated');
      }

      await tx.returnRequest.update({
        where: { id: returnId },
        data: { refundStatus: 'PENDING' }
      });

      return returnReq;
    });

    try {
      // Execute provider refund
      const refundResult = await paymentService.refundPayment(result.order.paymentAttemptId, result.refundAmountMinor!);

      await prisma.returnRequest.update({
        where: { id: returnId },
        data: {
          refundStatus: refundResult.status,
          providerRefundId: refundResult.providerRefundId
        }
      });
    } catch (error: any) {
      await prisma.returnRequest.update({
        where: { id: returnId },
        data: { refundStatus: 'FAILED' }
      });
      throw error;
    }
  }

  async processInspection(returnId: string, lineDispositions: { returnLineId: string, disposition: 'RESTOCKABLE' | 'DAMAGED' | 'NON_RESELLABLE' }[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT * FROM "ReturnRequest" WHERE "id" = ${returnId} FOR UPDATE`;
      
      const returnReq = await tx.returnRequest.findUnique({
        where: { id: returnId },
        include: { lines: true }
      });
      if (!returnReq) throw ApiError.notFound('Return request not found');

      if (returnReq.status === 'INSPECTED' || returnReq.status === 'CLOSED') {
         throw ApiError.badRequest('Return is already inspected or closed');
      }

      for (const lineDisp of lineDispositions) {
        const line = returnReq.lines.find(l => l.id === lineDisp.returnLineId);
        if (!line) throw ApiError.badRequest(`Return line ${lineDisp.returnLineId} not found`);

        if (line.disposition !== 'PENDING') {
           continue; // Already processed
        }

        await tx.returnLine.update({
          where: { id: line.id },
          data: { disposition: lineDisp.disposition }
        });

        if (lineDisp.disposition === 'RESTOCKABLE') {
           // We call inventory service from outside transaction ideally, but for now we do it here inline.
           // Actually, it's safer to execute inventory restock within the same transaction to guarantee atomicity.
           // Let's reimplement restock inline since we are inside a tx.
           const orderLine = await tx.orderLine.findUnique({ where: { id: line.orderLineId } });
           if (orderLine) {
             const inventory = await tx.inventory.findUnique({ where: { productId: orderLine.productId } });
             if (inventory) {
               await tx.reservation.create({
                 data: { inventoryId: inventory.id, quantity: line.quantity, status: 'RESTORED', expiresAt: new Date() }
               });
               await tx.inventory.update({
                 where: { id: inventory.id },
                 data: { onHand: { increment: line.quantity } }
               });
             }
           }
        }
      }

      await tx.returnRequest.update({
        where: { id: returnId },
        data: { status: 'INSPECTED' }
      });
    });
  }

  private mapToDto(returnReq: any): ReturnRequestDto {
    return {
      id: returnReq.id,
      orderId: returnReq.orderId,
      status: returnReq.status as any,
      refundStatus: returnReq.refundStatus as any,
      reason: returnReq.reason,
      refundAmountMinor: returnReq.refundAmountMinor ? returnReq.refundAmountMinor.toString() : null,
      createdAt: returnReq.createdAt.toISOString(),
      lines: returnReq.lines ? returnReq.lines.map((l: any) => ({
        id: l.id,
        orderLineId: l.orderLineId,
        quantity: l.quantity,
        reason: l.reason,
        disposition: l.disposition as any
      })) : []
    };
  }
}

export const returnsService = new ReturnsService();
