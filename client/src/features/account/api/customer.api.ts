import { CustomerDto, CustomerAddressDto } from '../../../../../shared/contracts/auth/auth.dto';
import { UpdateProfileInput, CreateAddressInput, ClaimOrderInput } from '../../../../../shared/schemas/auth';

export const customerApi = {
  async getProfile(): Promise<{ profile: CustomerDto }> {
    const res = await fetch('/api/v1/me/profile');
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Failed to fetch profile');
    }
    return await res.json();
  },

  async updateProfile(data: UpdateProfileInput): Promise<{ profile: CustomerDto; message: string }> {
    const res = await fetch('/api/v1/me/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Failed to update profile');
    }
    return await res.json();
  },

  async getAddresses(): Promise<{ addresses: CustomerAddressDto[] }> {
    const res = await fetch('/api/v1/me/addresses');
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Failed to fetch addresses');
    }
    return await res.json();
  },

  async createAddress(data: CreateAddressInput): Promise<{ address: CustomerAddressDto; message: string }> {
    const res = await fetch('/api/v1/me/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Failed to create address');
    }
    return await res.json();
  },

  async deleteAddress(addressId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/v1/me/addresses/${addressId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Failed to delete address');
    }
    return await res.json();
  },

  async getOrders(page: number = 1, limit: number = 10): Promise<{ orders: any[]; pagination: any }> {
    const res = await fetch(`/api/v1/me/orders?page=${page}&limit=${limit}`);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Failed to fetch orders');
    }
    return await res.json();
  },

  async claimOrder(data: ClaimOrderInput): Promise<{ id: string; orderNumber: string; status: string; message: string }> {
    const res = await fetch('/api/v1/me/orders/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.message || 'Failed to claim order');
    }
    return await res.json();
  }
};
