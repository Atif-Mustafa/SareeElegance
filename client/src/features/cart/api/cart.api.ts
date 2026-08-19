import { CartValidationRequestDto } from '../../../../../shared/schemas/cart';
import { ValidatedCart } from '../../../../../shared/contracts/cart/cart-response';
import { ApiSuccess } from '../../../../../shared/contracts/api/success';

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

export const cartApi = {
  validateCart: async (request: CartValidationRequestDto) => {
    return fetchApi<ValidatedCart>('/api/v1/cart/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};
