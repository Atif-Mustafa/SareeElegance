import { InventoryAvailabilityDto, InventoryReservationDto } from '../../../../../shared/contracts/inventory/inventory-response';
import { ReserveInventoryRequest } from '../../../../../shared/contracts/inventory/inventory-request';

class ApiError extends Error {
  constructor(public status: number, public data: any) {
    super(data?.detail || 'An API error occurred');
  }
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData);
  }

  const data = await response.json();
  if (data.success && data.data) {
    return data.data as T;
  }
  return data as T;
}

export const inventoryApi = {
  checkAvailability: async (productId: string) => {
    return fetchApi<InventoryAvailabilityDto>(`/api/v1/inventory/${productId}/availability`);
  },

  reserve: async (request: ReserveInventoryRequest) => {
    return fetchApi<InventoryReservationDto>('/api/v1/inventory/reserve', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  release: async (reservationId: string) => {
    return fetchApi<{ success: boolean }>(`/api/v1/inventory/reservations/${reservationId}/release`, {
      method: 'POST',
    });
  }
};
