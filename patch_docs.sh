#!/bin/bash

# Update CHANGELOG.md
cat << 'CHANGE' >> docs/CHANGELOG.md

## [PR 11.1] Lifecycle Verification & Persistence Hardening

### Added
- Added focused `order-lifecycle.test.ts` covering valid access, idempotent cancellation, exact restoration, reconciliation, and concurrency.
- Added `RESTORED` status to `ReservationStatus` enum to safely mark consumed reservations that have been released via order cancellation.

### Changed
- Concurrency hardened: `cancelOrder` and `prepareFulfillment` now use row-level `FOR UPDATE` PostgreSQL locking to prevent race conditions.
- Access token hardened: `order.accessToken` is now securely hashed with SHA-256 before storage. The raw access token is returned exactly once during order confirmation.
- Database hardened: Added indexing on `Order.status` and `Reservation.status`. Confirmed existing constraints (`FulfillmentHandoff.orderId` unique, `Order.orderNumber` unique).
CHANGE

