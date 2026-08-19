import { ShippingProvider } from './shipping-provider';
import { randomBytes } from 'crypto';

export class MockShippingProvider implements ShippingProvider {
  async createShipment(request: { orderId: string, address: any, lines: any[] }) {
    // Deterministic mock behavior: if orderId includes "FAIL_CREATE", fail it.
    if (request.orderId.includes('FAIL_CREATE')) {
      throw new Error('Provider rejected shipment creation');
    }
    
    return {
      providerShipmentId: `shp_${randomBytes(8).toString('hex')}`,
      trackingNumber: `AWB${Math.floor(10000000 + Math.random() * 90000000)}`
    };
  }

  async getTracking(providerShipmentId: string) {
    return { status: 'IN_TRANSIT' };
  }

  async cancelShipment(providerShipmentId: string) {
    if (providerShipmentId.includes('FAIL_CANCEL')) {
      throw new Error('Provider rejected cancellation');
    }
  }
}

export const mockShippingProvider = new MockShippingProvider();
