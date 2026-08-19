import { useState, useEffect } from 'react';
import { inventoryApi } from '../api/inventory.api';
import { InventoryAvailabilityDto } from '../../../../../shared/contracts/inventory/inventory-response';

export function useInventory(productId?: string) {
  const [availability, setAvailability] = useState<InventoryAvailabilityDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchInventory() {
      if (!productId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await inventoryApi.checkAvailability(productId);
        if (!ignore) setAvailability(data);
      } catch (err: any) {
        if (!ignore) setError(err.message || 'Failed to check availability');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    fetchInventory();
    return () => { ignore = true; };
  }, [productId]);

  return { availability, isLoading, error };
}
