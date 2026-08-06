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
- **Responsibilities**: Curating saree storytelling, weaving specifications, regional cluster profiles, and pricing tiers.
- **Aggregate Root**: `Product` (Saree SKU).
- **Entities**: `ProductVariant`, `ProductImage`, `ProductAttribute`, `Category`, `Collection`, `Fabric`, `Weave`, `Technique`, `Pattern`, `Motif`, `Artisan`, `Region`.
- **Public Services**: Catalog Query Service, Merchandising Command Service.
- **Published Events**: `ProductCreated`, `ProductUpdated`, `ProductPublished`, `ProductUnpublished`, `ProductPriceChanged`.
- **Transaction Boundaries**: Updates to a product and its attributes/variants must be strictly transactional.

### 3.2 Inventory & Warehouse Context
- **Responsibilities**: Tracking physical 1-of-1 unique saree availability, loom re-weave schedules, and real-time stock holds.
- **Aggregate Root**: `Inventory`, `Warehouse`.
- **Entities**: `InventoryTransaction`, `StockHoldReservation`.
- **Public Services**: Stock Availability Service, Reservation Service.
- **Consumed Events**: `OrderPlaced`, `OrderCancelled`, `ReturnRequested`.
- **Published Events**: `InventoryAdjusted`, `InventoryReserved`, `InventoryReservationExpired`, `InventoryReleased`.
- **Forbidden Dependencies**: Cannot synchronously depend on Order or Payment logic.

### 3.3 Order Management System (OMS) & Checkout Context
- **Responsibilities**: Managing multi-currency checkout, GST/VAT tax calculation, payment capture, and DDP fulfillment lifecycle.
- **Aggregate Root**: `Order`, `Cart`.
- **Entities**: `OrderItem`, `Payment`, `Shipment`, `TaxRule`, `ShippingRule`, `Return`.
- **Public Services**: Checkout Service, Order Processing Service, Payment Gateway Service.
- **Published Events**: `CartConvertedToOrder`, `OrderPlaced`, `OrderConfirmed`, `OrderCancelled`, `PaymentInitiated`, `PaymentAuthorized`, `PaymentSucceeded`, `PaymentFailed`, `RefundRequested`, `RefundSucceeded`, `ShipmentCreated`, `ShipmentDispatched`, `ShipmentDelivered`, `ReturnRequested`.

### 3.4 Customer & Loyalty Context (Identity and Access)
- **Responsibilities**: Authentication, RBAC governance, heirloom wishlist curation, reviews, and bridal preference profiles.
- **Aggregate Root**: `User`.
- **Entities**: `Address`, `Wishlist`, `Review`, `Rating`, `RefreshToken`.
- **Public Services**: Authentication Service, User Profile Service, Wishlist Service.
- **Published Events**: `ReviewSubmitted`, `UserPreferenceUpdated`.

### 3.5 Localization & Currency Context
- **Responsibilities**: Maintaining live currency conversion ledgers, regional GST/VAT tax percentages, and translation strings.
- **Aggregate Root**: `Country`, `Currency`.
- **Entities**: `ExchangeRate`, `Language`, `TranslationEntry`.
- **Public Services**: Pricing Localization Service, Translation Service.
- **Published Events**: `ExchangeRatesUpdated`, `LocalizationConfigUpdated`.

### 3.6 Content and CMS Context
- **Responsibilities**: Managing home page banners, editorial heritage stories, promotional ribbons.
- **Entities**: `HeroBanner`, `PromotionalRibbon`, `HeritageStory`, `CampaignBlock`.
- **Published Events**: `CMSContentPublished`.

### 3.7 AI Concierge & Recommendations Context
- **Responsibilities**: AI Bridal Styling, visual search motif matching, similar saree vector recommendations.
- **Public Services**: AI Consultation Service, Semantic Search Service.
- **Dependencies**: Depends on Catalog Context for read-only product data and `pgvector` embeddings.

### 3.8 Notifications Context
- **Responsibilities**: Sending transactional and marketing notifications across Email, SMS, WhatsApp, and WebSockets.
- **Consumed Events**: `NotificationRequested` and all major domain events (`OrderPlaced`, `ShipmentDispatched`, etc.).

---

## 4. Context Integration & Anti-Corruption Layers (ACL)
- **Shared Kernel**: Zod domain schemas (`/src/shared/schemas`) act as the shared contract across contexts.
- **Anti-Corruption Layer (ACL)**: When the OMS interacts with external payment gateways (Stripe, Razorpay) or logistics providers, an ACL adapter translates external payloads into internal domain entities to prevent external model leakage.
- **Dependency Direction Rules**:
  - The core domain (Catalog, OMS) must NOT depend on infrastructure details or external APIs directly.
  - Controllers must not contain business logic; they delegate to Domain Services.
  - Circular dependencies between contexts are strictly forbidden. Use domain events to decouple.
