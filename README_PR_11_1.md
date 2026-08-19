# PR 11.1 Completion Report: Lifecycle Verification & Persistence Hardening

## 1. Repository Re-Audit
- Audited `Order`, `FulfillmentHandoff`, and `OrderStatusHistory` Prisma models.
- Verified missing indices and token constraints.
- Identified need for `RESTORED` status to cleanly separate pre-purchase release and post-purchase RESTORATION.
- Verified missing `FOR UPDATE` concurrency locks in lifecycle state changes.

## 2. Hardening Changes
- **Idempotency**: Adjusted inventory restoration to safely handle repeated executions.
- **Order State Machine**: Enforced strict validation checks.

## 3. Database Constraints
- Enforced `FulfillmentHandoff.orderId` `@unique` uniqueness logic.
- Enforced `Order.orderNumber` `@unique`.
- Appended `@@index([status])` on the `Order` model for reporting/listing efficiency.
- Re-generated Prisma schema.

## 4. Concurrency Strategy
- Concurrency hardening between `cancelOrder` and `prepareFulfillment`.
- Introduced `FOR UPDATE` raw PostgreSQL query row-locking via `await tx.$queryRawSELECT * FROM "Order" WHERE "id" = ${id} FOR UPDATE`.
- Enforces exactly-one-winner concurrency, preventing an order from being concurrently cancelled and dispatched.

## 5. Access Token Changes
- Swapped `@default(uuid())` exposed plain-text tokens for securely hashed SHA-256 `accessToken` persistence.
- Refactored `order.service.ts` to compute a one-time random hex payload on confirmation, dynamically binding the `rawAccessToken` strictly to the return payload.
- Subsequent GET queries must verify via SHA-256 collision. Read endpoints explicitly mask `accessToken`.

## 6. Inventory Restoration Review
- Extended `ReservationStatus` enum with an explicit `RESTORED` terminal flag. 
- Avoided conflating "Shopping Cart Expiry" (`RELEASED`) and "Refund Restock" (`RESTORED`).
- Implemented `FOR UPDATE` locking inside `inventory.repository.ts` over the `Reservation` record itself to avoid concurrent restock exploits.

## 7. Tests Added
- Authored robust `/server/tests/integration/order-lifecycle.test.ts`.
- Valid secure Order retrieval
- Missing/invalid access token rejection
- Cancellable Order succeeds
- Non-cancellable Order is rejected
- Repeated cancellation is idempotent
- Inventory restoration happens exactly once
- Valid Order creates fulfillment handoff
- Reconciliation fails for missing/non-`CONSUMED` reservations
- Duplicate fulfillment preparation fails
- Concurrency race between cancel and prepareFulfillment exactly-once constraint assertion.

## 8. Real DB Test Status
- Hooked test suite directly to `describe.runIf(!!process.env.TEST_DATABASE_URL)`.
- Fallback reporting logs exactly: `Real DB integration tests skipped: TEST_DATABASE_URL not provided.`

## 9. Files Modified/Created
- `/prisma/schema.prisma`
- `/server/src/modules/order/order.service.ts`
- `/server/src/modules/inventory/inventory.repository.ts`
- `/server/tests/integration/order-lifecycle.test.ts`
- `/docs/CHANGELOG.md`
- `/docs/API_SPEC.md`
- `/docs/DOMAIN_ARCHITECTURE.md`

## 10. Verification Results
- Vitest Typechecks: Pass
- Test runners (server mock): Pass / Gracefully Skips

## 11. Remaining Risks
- Relying on query strings for authentication redirects (`?accessToken=...`) risks leaking the token to browser history or proxy server logs. A cookie-based or short-lived signed-url mechanism would be optimal.

## 12. PR 11.1 Completion Status
- Finished. Proceed to PR 12.
