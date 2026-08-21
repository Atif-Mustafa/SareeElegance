import {
  AdminProductDto,
  AdminInventoryItemDto,
  AdminInventoryAdjustmentRecordDto,
  AdminOrderListItemDto,
  AdminOrderDetailsDto,
  AdminShipmentDto,
  AdminReturnListItemDto,
  AdminReturnDetailsDto,
  ReconciliationExceptionsDto,
  AdminAuditLogDto
} from '@shared/contracts/admin/admin.dto';

const BASE_URL = '/api/admin';

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Administrative operation failed');
  }

  return data.data as T;
}

export const adminApi = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    return fetchJson<{ admin: any; sessionToken: string }>(`${BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getMe: async () => {
    return fetchJson<any>(`${BASE_URL}/me`);
  },

  // Catalog
  getProducts: async (params?: { search?: string; status?: string; categoryId?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    return fetchJson<{ products: AdminProductDto[]; total: number }>(`${BASE_URL}/products?${query.toString()}`);
  },

  getCategories: async () => {
    return fetchJson<Array<{ id: string; name: string; slug: string }>>(`${BASE_URL}/categories`);
  },

  createProduct: async (product: any) => {
    return fetchJson<AdminProductDto>(`${BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  updateProduct: async (id: string, updates: any) => {
    return fetchJson<AdminProductDto>(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  updateProductStatus: async (id: string, status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED') => {
    return fetchJson<AdminProductDto>(`${BASE_URL}/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  updateProductPrice: async (id: string, payload: { priceMinor: string; currency: string; reason: string }) => {
    return fetchJson<AdminProductDto>(`${BASE_URL}/products/${id}/price`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Inventory
  getInventory: async (params?: { search?: string; lowStockOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.lowStockOnly) query.set('lowStockOnly', 'true');
    return fetchJson<AdminInventoryItemDto[]>(`${BASE_URL}/inventory?${query.toString()}`);
  },

  adjustStock: async (payload: {
    productId: string;
    quantityDelta: number;
    reason: string;
    note?: string;
    idempotencyKey?: string;
  }) => {
    return fetchJson<AdminInventoryAdjustmentRecordDto>(`${BASE_URL}/inventory/adjust`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getProductInventoryHistory: async (productId: string) => {
    return fetchJson<{ adjustments: AdminInventoryAdjustmentRecordDto[]; reservations: any[] }>(
      `${BASE_URL}/inventory/${productId}/history`
    );
  },

  // Fulfillment
  getOrders: async (params?: { search?: string; status?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    return fetchJson<{ orders: AdminOrderListItemDto[]; total: number }>(`${BASE_URL}/orders?${query.toString()}`);
  },

  getOrderDetails: async (id: string) => {
    return fetchJson<AdminOrderDetailsDto>(`${BASE_URL}/orders/${id}`);
  },

  prepareOrder: async (orderId: string) => {
    return fetchJson<any>(`${BASE_URL}/orders/${orderId}/prepare`, {
      method: 'POST',
    });
  },

  dispatchOrder: async (orderId: string) => {
    return fetchJson<AdminShipmentDto>(`${BASE_URL}/orders/${orderId}/dispatch`, {
      method: 'POST',
    });
  },

  // Shipping
  getShipments: async (params?: { search?: string; status?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    return fetchJson<{ shipments: AdminShipmentDto[]; total: number }>(`${BASE_URL}/shipments?${query.toString()}`);
  },

  getShipmentById: async (id: string) => {
    return fetchJson<any>(`${BASE_URL}/shipments/${id}`);
  },

  retryShipment: async (orderId: string) => {
    return fetchJson<AdminShipmentDto>(`${BASE_URL}/shipments/${orderId}/retry`, {
      method: 'POST',
    });
  },

  // Returns
  getReturns: async (params?: { search?: string; status?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    return fetchJson<{ returns: AdminReturnListItemDto[]; total: number }>(`${BASE_URL}/returns?${query.toString()}`);
  },

  getReturnById: async (id: string) => {
    return fetchJson<AdminReturnDetailsDto>(`${BASE_URL}/returns/${id}`);
  },

  approveReturn: async (id: string) => {
    return fetchJson<any>(`${BASE_URL}/returns/${id}/approve`, {
      method: 'POST',
    });
  },

  rejectReturn: async (id: string, reason: string) => {
    return fetchJson<any>(`${BASE_URL}/returns/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  inspectReturn: async (id: string, dispositions: Array<{ lineId: string; disposition: 'RESTOCKABLE' | 'DAMAGED' | 'NON_RESELLABLE' }>) => {
    return fetchJson<any>(`${BASE_URL}/returns/${id}/inspect`, {
      method: 'POST',
      body: JSON.stringify({ dispositions }),
    });
  },

  issueRefund: async (id: string) => {
    return fetchJson<any>(`${BASE_URL}/returns/${id}/refund`, {
      method: 'POST',
    });
  },

  // Reconciliation
  getReconciliationExceptions: async () => {
    return fetchJson<ReconciliationExceptionsDto>(`${BASE_URL}/reconciliation/exceptions`);
  },

  retryReconciliationOrder: async (orderId: string) => {
    return fetchJson<any>(`${BASE_URL}/reconciliation/orders/${orderId}/retry`, {
      method: 'POST',
    });
  },

  // Audit Logs
  getAuditLogs: async (params?: { action?: string; targetType?: string; actorId?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.action) query.set('action', params.action);
    if (params?.targetType) query.set('targetType', params.targetType);
    if (params?.actorId) query.set('actorId', params.actorId);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    return fetchJson<AdminAuditLogDto[]>(`${BASE_URL}/audit-logs?${query.toString()}`);
  },
};
