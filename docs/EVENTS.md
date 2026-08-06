# Event-Driven Architecture (EDA) & Messaging

---

## 1. Executive Summary

To decouple high-frequency transactional mutations from downstream side effects, the platform implements an **Event-Driven Architecture** utilizing Redis Pub/Sub and **BullMQ** persistent job queues. 

We distinguish between:
- **Domain Events**: Internal business occurrences (e.g., `OrderPlaced`).
- **Integration Events**: Events published across context boundaries (can be same as domain events in a monolith but intended for external/detached consumers).
- **Background Jobs**: Scheduled or async tasks (e.g., `SyncExchangeRates`).
- **Commands**: Requests to perform an action (e.g., `SendWelcomeEmail`).
- **Webhooks**: External incoming HTTP events from Stripe, Razorpay, or Logistics providers.

---

## 2. Canonical Domain Events Taxonomy

All domain events follow a versioned JSON schema wrapped in a standardized event envelope.

### 2.1 Standard Event Envelope
```json
{
  "eventId": "evt_uuid_5566-7788",
  "eventType": "OrderPlaced",
  "eventVersion": "v1",
  "occurredAt": "2026-08-03T03:55:12.045Z",
  "aggregateId": "ord-uuid-5566-7788",
  "aggregateType": "Order",
  "correlationId": "trc-uuid-9921-8812",
  "causationId": "cmd_uuid_checkout_submit",
  "producer": "OMS_Context",
  "payload": {
    "orderId": "ord-uuid-5566-7788",
    "totalAmountINR": 185000,
    "customerId": "usr-uuid-1122-3344"
  }
}
```

### 2.2 Core Events

- **Catalog**: `ProductCreated`, `ProductUpdated`, `ProductPublished`, `ProductUnpublished`, `ProductPriceChanged`
- **Inventory**: `InventoryAdjusted`, `InventoryReserved`, `InventoryReservationExpired`, `InventoryReleased`
- **Checkout/Orders**: `CartConvertedToOrder`, `OrderPlaced`, `OrderConfirmed`, `OrderCancelled`
- **Payments**: `PaymentInitiated`, `PaymentAuthorized`, `PaymentSucceeded`, `PaymentFailed`, `RefundRequested`, `RefundSucceeded`
- **Shipping**: `ShipmentCreated`, `ShipmentDispatched`, `ShipmentDelivered`, `ReturnRequested`
- **Customer/Localization/CMS**: `ReviewSubmitted`, `ExchangeRatesUpdated`, `LocalizationConfigUpdated`, `CMSContentPublished`, `UserPreferenceUpdated`
- **Notifications**: `NotificationRequested`

---

## 3. Transactional Outbox Pattern & Reliability

To guarantee **at-least-once delivery** without distributed two-phase commit transactions, domain mutations write event records to a PostgreSQL `OutboxMessage` table within the same ACID database transaction as the business entity update.

1. **Transaction Begins**.
2. Update Entity (e.g., `Order` state to `CONFIRMED`).
3. Insert Event into `OutboxMessage` table.
4. **Transaction Commits**.
5. A background worker polls `OutboxMessage` and publishes them to BullMQ.

*Note: For the current MVP phase, the outbox pattern is implemented minimally for critical workflows (like Payments and Inventory) and will be expanded to all events as needed.*

---

## 4. Consumer Reliability & Idempotency

- **Duplicate Delivery**: BullMQ guarantees at-least-once delivery, meaning duplicate events are possible.
- **Idempotency Keys**: Consumers enforce idempotent processing by recording `eventId` signatures in Redis (`idempotency:event:{eventId}`). 
- **Retry Policy & Backoff**: Failed event processing automatically retries with exponential backoff (e.g., 3 retries: 5s, 25s, 125s).
- **Dead-Letter Queue (DLQ)**: Poison messages that fail all retries are routed to a DLQ (`bullmq:queue:DLQ`) for manual engineering inspection and replay strategy via the BullMQ UI.
- **Event Retention**: Completed events are pruned from BullMQ after 7 days to preserve Redis memory.
