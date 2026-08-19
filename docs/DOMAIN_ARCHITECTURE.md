# Domain-Driven Architecture & Bounded Contexts

---

## 1. Executive Summary

To prevent enterprise complexity from eroding architectural boundaries, the backend business logic is partitioned into explicit **Bounded Contexts** following Domain-Driven Design (DDD) principles. Each context encapsulates its own ubiquitous language, domain entities, aggregate roots, and transactional consistency boundaries.

The current system operates as a **Modular Monolith**. We do not require microservices unless scale, team ownership, or operational needs justify them in the future. Module boundaries allow future extraction without requiring an immediate distributed architecture.

---

## 2. Enterprise Context Map

```text
+-------------------------------------------------------------------------------------------------+
|                                 ENTERPRISE CONTEXT MAP (DDD)                                    |
|                                                                                                 |
|   +--------------------------+          [Customer-Supplier]         +-----------------------+   |
|   |  Catalog & Merchandising | ===================================> | Inventory & Warehouse |   |
|   |         Context          |                                      |        Context        |   |
|   +------------+-------------+                                      +-----------+-----------+   |
|                |                                                                |               |
|                | [Published Language]                                           | [ACL / Event] |
|                v                                                                v               |
|   +--------------------------+          [Shared Kernel: Zod]        +-----------------------+   |
|   |  AI Concierge & Styling  | <==================================> |   Order Management    |   |
|   |         Context          |                                      | & Checkout (OMS) Ctx  |   |
|   +--------------------------+                                      +-----------+-----------+   |
|                                                                                 |               |
|                                                                                 | [Event Bus]   |
|                                                                                 v               |
|                                                                     +-----------------------+   |
|                                                                     | Customer & Loyalty    |   |
|                                                                     |        Context        |   |
|                                                                     +-----------------------+   |
+-------------------------------------------------------------------------------------------------+
```

---

## 3. Core Bounded Contexts

### 3.1 Catalog & Merchandising Context
- **Responsibilities**: Curating saree storytelling, weaving specifications, regional cluster profiles, and pricing tiers. Note: Catalog persistence is strictly separated from Inventory.
- **Aggregate Root**: `Product` (Saree SKU).
- **Entities**: `SareeDetails`, `ProductMedia`, `ProductColor`, `ProductOccasion`, `Category`.

### 3.2 Cart & Commerce Policy Context
- **Responsibilities**: Resolving transient intent into verified financial amounts. Validates pricing integrity, prevents currency mixing, applies cart-level policies (999 unit limit), and fails safely against upstream downtime.
- **Aggregate Root**: `CartValidationResult`.
- **Entities**: `CartLine`, `Money`.
- **Invariant Policy**: The frontend client is NEVER authoritative over the price of an item or the subtotal of the cart. Any locally derived values are explicitly presented as unverified until validated statelessly by the backend. If the backend is unreachable (e.g. database failure), the domain must fail closed (emit 503) and suppress checkout flow.

## Catalog API Boundary
The Public Catalog API enforces strict lifecycle rules (e.g. `status: 'ACTIVE'` only).
Raw Prisma models are mapped via explicit domain Mappers (`catalog.mapper.ts`) before being exposed.
**Crucially, all Prisma/PostgreSQL `BigInt` prices are converted explicitly to `string` in the API mapping layer.** This ensures that precision is not lost and we do not introduce dangerous global `BigInt.prototype.toJSON` overrides. 

### 3.3 Inventory & Warehouse Context
- **Responsibilities**: Providing authoritative inventory availability, enforcing real-time concurrency locks, preventing overselling, and managing temporary reservations (holds) and expirations.
- **Aggregate Root**: `Inventory`.
- **Entities**: `Reservation`.
- **Invariant Policy**: Cart validation does not reserve inventory. Reservations require explicit lifecycle actions (`ACTIVE`, `RELEASED`, `EXPIRED`, `CONSUMED`) and must utilize atomic database locking (e.g. `FOR UPDATE`) to prevent race conditions during high-concurrency checkout phases. Client availability reads must not be treated as authoritative; oversell protection happens securely at the database level.

### 3.4 Checkout & Payment Context
- **Purpose**: Secure orchestration of pricing, inventory, and payment collection.
- **Key Concepts**: CheckoutSession, Immutable Line Snapshots, Payment Intent.
- **Boundaries**: Operates statelessly regarding inventory, requesting reservations via the Inventory Context and rolling back holds if payment fails or expires.
- **Outputs**: Confirmed Order.

### 3.6 Shipping & Delivery Context
- **Purpose**: Authoritative execution and tracking of fulfilled shipments.
- **Key Concepts**: Shipment, Provider, Tracking, Webhooks.
- **Boundaries**: Purely operational execution. Does not own pricing or commercial order state. Requires a `READY_FOR_FULFILLMENT` Order and its `FulfillmentHandoff`.
- **Rules**:
  - Shipping status is exclusively dictated by the external provider (e.g. Courier).
  - Tracking numbers and delivery times are never fabricated locally.
  - Order status is independent; shipping events map explicitly without sharing enums.


### 3.5 Order & Post-Payment Context
- **Purpose**: Authoritative lifecycle management for confirmed orders.
- **Key Concepts**: Order, OrderStatusHistory, FulfillmentHandoff.
- **Boundaries**: Strictly accepts finalized Orders from the Checkout context. Authoritative for customer-facing order states (e.g., CONFIRMED, READY_FOR_FULFILLMENT).
- **Rules**:
  - **No Pricing Mutation**: Order lines and totals are completely immutable once finalized.
  - **Cancellation Window**: Cancellations are permitted until the state reaches `READY_FOR_FULFILLMENT`. Database-level row locking (`FOR UPDATE`) ensures exactly-once execution and prevents race conditions between cancellation and fulfillment handoff.
  - **Secure Access Tokens**: Order access tokens are securely hashed via SHA-256 in the database. Raw tokens are issued once at confirmation.
  - **Inventory Reconciliation**: Cancellation automatically delegates inventory rollback to the Inventory Context.
