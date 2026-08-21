import { UserRole } from '../auth/auth.dto';
import { Money } from '../money/money';

export interface AdminProductDto {
  id: string;
  sku: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  price: Money;
  compareAtPrice?: Money | null;
  currency: string;
  primaryMedia: { url: string; altText?: string | null } | null;
  media: Array<{ url: string; altText?: string | null }>;
  category: { id: string; name: string; slug: string } | null;
  sareeDetails: {
    fabric?: string;
    weave?: string;
    zariType?: string | null;
    motif?: string | null;
    region?: string | null;
    washCare?: string | null;
    blousePiece?: string | null;
  } | null;
  inventorySummary: {
    onHand: number;
    activeReservations: number;
    available: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminInventoryItemDto {
  productId: string;
  sku: string;
  productName: string;
  productSlug: string;
  productStatus: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  categoryName: string | null;
  onHand: number;
  activeReservations: number;
  available: number;
  lastAdjustment?: {
    reason: string;
    quantityDelta: number;
    createdAt: string;
    actorEmail: string | null;
  } | null;
}

export interface AdminInventoryAdjustmentRecordDto {
  id: string;
  inventoryId: string;
  previousOnHand: number;
  quantityDelta: number;
  newOnHand: number;
  reason: 'MANUAL_CORRECTION' | 'STOCK_RECEIPT' | 'DAMAGE' | 'RETURN_RESTOCK' | 'CYCLE_COUNT';
  note: string | null;
  actorId: string;
  actorEmail: string | null;
  idempotencyKey: string | null;
  createdAt: string;
}

export interface AdminAuditLogDto {
  id: string;
  actorId: string;
  actorEmail: string | null;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: any;
  createdAt: string;
}

export interface AdminShipmentDto {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  provider: string;
  trackingNumber: string | null;
  recipientName: string;
  destinationSummary: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
    location?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderListItemDto {
  id: string;
  orderNumber: string;
  status: string;
  email: string | null;
  phone: string | null;
  total: Money;
  itemsCount: number;
  shippingAddress: any;
  fulfillmentStatus: 'NOT_STARTED' | 'PENDING_HANDOFF' | 'READY_FOR_FULFILLMENT' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  shipment?: {
    id: string;
    trackingNumber: string | null;
    status: string;
    provider: string;
  } | null;
  createdAt: string;
}

export interface AdminOrderDetailsDto {
  id: string;
  orderNumber: string;
  status: string;
  email: string | null;
  phone: string | null;
  total: Money;
  subtotal: Money;
  discount: Money | null;
  shipping: Money | null;
  taxes: Money | null;
  itemsCount: number;
  shippingAddress: any;
  billingAddress: any;
  lines: Array<{
    id: string;
    productId: string;
    sku: string | null;
    name: string;
    quantity: number;
    price: Money;
    lineSubtotal: Money;
    lineSubtotalMinor: string;
    customizations?: any;
  }>;
  fulfillmentHandoff?: {
    id: string;
    status: string;
    createdAt: string;
  } | null;
  shipment?: AdminShipmentDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReturnListItemDto {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  refundStatus: string;
  refundAmount: Money | null;
  reason: string | null;
  linesCount: number;
  createdAt: string;
  lines: Array<{
    id: string;
    orderLineId: string;
    productName: string;
    quantity: number;
    reason: string | null;
    disposition: 'PENDING' | 'RESTOCKABLE' | 'DAMAGED' | 'NON_RESELLABLE';
  }>;
}

export interface AdminReturnDetailsDto {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  refundStatus: string;
  refundAmount: Money | null;
  reason: string | null;
  lines: Array<{
    id: string;
    orderLineId: string;
    productId: string;
    sku: string | null;
    productName: string;
    quantity: number;
    reason: string | null;
    disposition: 'PENDING' | 'RESTOCKABLE' | 'DAMAGED' | 'NON_RESELLABLE';
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationExceptionsDto {
  orphanedPayments: Array<{
    id: string;
    checkoutSessionId: string;
    amountMinor: string;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  unreconciledOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    email: string | null;
    totalMinor: string;
    currency: string;
    reason: string;
    createdAt: string;
  }>;
  stalledFulfillments: Array<{
    orderId: string;
    orderNumber: string;
    handoffId: string;
    handoffStatus: string;
    createdAt: string;
  }>;
  failedRefunds: Array<{
    returnId: string;
    orderId: string;
    refundStatus: string;
    refundAmountMinor: string | null;
    createdAt: string;
  }>;
  inventoryAnomalies: Array<{
    productId: string;
    productName: string;
    onHand: number;
    activeReservations: number;
    issue: string;
  }>;
}
