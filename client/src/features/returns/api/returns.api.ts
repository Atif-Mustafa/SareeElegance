import { CreateReturnRequestDto, ReturnRequestDto } from '../../../../../shared/contracts/returns/return';

export const returnsApi = {
  async getReturns(orderId: string, accessToken: string): Promise<ReturnRequestDto[]> {
    const res = await fetch(`/api/v1/orders/${orderId}/returns?accessToken=${accessToken}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to fetch returns');
    }
    return res.json();
  },

  async createReturn(orderId: string, payload: CreateReturnRequestDto, accessToken: string): Promise<ReturnRequestDto> {
    const res = await fetch(`/api/v1/orders/${orderId}/returns?accessToken=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create return request');
    }
    return res.json();
  }
};
