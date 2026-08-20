export type ReturnStatusDto = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'AWAITING_RETURN' | 'IN_TRANSIT' | 'RECEIVED' | 'INSPECTED' | 'CLOSED';
export type RefundStatusDto = 'NOT_REQUESTED' | 'PENDING' | 'SUCCEEDED' | 'FAILED';

export interface ReturnRequestDto {
  id: string;
  orderId: string;
  status: ReturnStatusDto;
  refundStatus: RefundStatusDto;
  reason: string | null;
  createdAt: string;
  lines: ReturnLineDto[];
  refundAmountMinor: string | null;
}

export interface ReturnLineDto {
  id: string;
  orderLineId: string;
  quantity: number;
  reason: string | null;
  disposition: 'PENDING' | 'RESTOCKABLE' | 'DAMAGED' | 'NON_RESELLABLE';
}

export interface CreateReturnRequestDto {
  reason: string;
  lines: {
    orderLineId: string;
    quantity: number;
    reason?: string;
  }[];
}
