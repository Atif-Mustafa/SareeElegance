# Enterprise Inventory & Reservation Architecture

---

## 1. Executive Summary

Because luxury heritage sarees are predominantly **1-of-1 unique pieces** (e.g., a specific hand-woven Banarasi Kadwa), inventory accuracy is the most critical constraint in the system. Overselling a unique artifact causes severe brand damage and customer dissatisfaction.

---

## 2. The Inventory Reservation Lifecycle

We do not rely solely on frontend cart state. Inventory is managed strictly via authoritative backend locks.

1. **Checkout Initiated**: The customer proceeds to the checkout screen.
2. **Atomic Reservation Attempt**: The backend attempts to place a lock on the `Inventory` record.
   - If `available_quantity < requested`, checkout halts with `ERR_SAREE_SOLD_OUT`.
3. **Timer Started**: A temporary `StockHoldReservation` is created with a strict **15-minute expiration time**.
4. **Payment Processing**: The customer submits payment.
5. **Success Confirmation**: Upon webhook receipt of payment success, the temporary reservation is permanently converted to `Sold` inventory.
6. **Failure / Expiration**: If payment fails or the 15-minute timer expires, the reservation is released back to the general pool.

---

## 3. Concurrency Control & Database Locking

- **Optimistic Concurrency**: The `Inventory` table utilizes a `@version` column. When a reservation is attempted, Prisma executes:
  ```sql
  UPDATE "Inventory" SET quantity = quantity - 1, version = version + 1
  WHERE id = $1 AND quantity > 0 AND version = $2;
  ```
  If 0 rows are updated, it implies a concurrent transaction beat the current request, and an error is thrown.
- **Row Locking**: For highly contested flash sales, explicit `SELECT ... FOR UPDATE` row locks are applied inside the PostgreSQL transaction.

---

## 4. Worker Recovery & Cleanup

A BullMQ scheduled job (`inventory-hold-reaper`) runs every 60 seconds. It scans the `StockHoldReservation` table for holds that have exceeded their `expiresAt` timestamp and are not attached to a `PAID` order. 

The worker automatically deletes the hold, increments the available inventory, and publishes an `InventoryReleased` domain event to alert other users that the item is back in stock.

---

## 5. Admin Overrides & Quarantine

- **Damaged Inventory**: If a saree fails final quality check before shipping, Merchandisers can manually mark the stock as `QUARANTINED` via the Admin portal.
- **Returned Inventory**: When an item is returned, it undergoes inspection. It is not automatically added back to the active pool; a Merchandiser must explicitly issue an `INVENTORY_MANUAL_ADJUSTMENT` to restock it.
