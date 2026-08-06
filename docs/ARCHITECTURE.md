# Enterprise E-Commerce Platform — System Architecture

This document defines the production-grade architectural blueprint for the enterprise e-commerce platform. Our architecture strictly adheres to **SOLID**, **DRY**, **KISS**, **YAGNI**, and **Clean Architecture** principles.

---

## 1. Executive Overview

The application follows a decoupled full-stack architecture:
- **Frontend**: React 19 + TypeScript + Vite Single-Page Application (SPA) with Zustand (client global state) and TanStack Query (server state & caching).
- **Backend**: Node.js LTS + Express.js + TypeScript REST API following Layered/Clean Architecture.
- **Database Layer**: PostgreSQL relational database accessed via Prisma ORM, with Redis for high-speed caching and BullMQ for background job processing.
- **Ingress & Edge**: Nginx reverse proxy / CDN layer handling TLS termination, asset caching, and request routing.

---

## 2. High-Level Architectural Diagram

```
+-----------------------------------------------------------------------------------------+
|                                  CLIENT LAYER (React 19)                                |
|                                                                                         |
|  +------------------------+  +--------------------------+  +-------------------------+  |
|  |     Zustand Store      |  |      TanStack Query      |  |         i18next         |  |
|  |  (Client Global State: |  |   (Server State Caching: |  |   (Dynamic Localization |  |
|  |   Cart, UI, Locale)    |  |    Products, Config)     |  |    & RTL Layout Engine) |  |
|  +-----------+------------+  +------------+-------------+  +------------+------------+  |
+--------------|----------------------------|-----------------------------|---------------+
               |                            |                             |                
               | (REST / JSON)              | (REST / JSON)               | (CDN / HTTP)   
               v                            v                             v                
+-----------------------------------------------------------------------------------------+
|                              INGRESS / API GATEWAY (Nginx / CDN)                        |
|                  (Rate Limiting • Edge Caching • Gzip/Brotli • SSL/TLS)                 |
+-----------------------------------------------------------------------------------------+
                                            |
                                            v
+-----------------------------------------------------------------------------------------+
|                        BACKEND SERVICE LAYER (Node.js LTS + Express)                    |
|                                                                                         |
|  +------------------------+  +--------------------------+  +-------------------------+  |
|  |    Controllers Layer   |  |      Services Layer      |  |    Repositories/Prisma  |  |
|  |  (HTTP, Zod Validate)  |  |   (Core Business Logic)  |  |    (Data Access Layer)  |  |
|  +-----------+------------+  +------------+-------------+  +------------+------------+  |
|              |                            |                             |               |
|              +----------------------------+-----------------------------+               |
|                                           |                                             |
|                                           v                                             |
|  +-----------------------------------------------------------------------------------+  |
|  |                     Redis Cache & BullMQ Background Workers                       |  |
|  |           (Session Tokens, Currency Rates, Cart Caching, Email Queues)            |  |
|  +-----------------------------------------------------------------------------------+  |
|                                           |                                             |
|                                           v                                             |
|  +-----------------------------------------------------------------------------------+  |
|  |                           PostgreSQL Relational Database                          |  |
|  |                (Normalized Enterprise Schema • Multi-Currency Ledger)             |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Frontend Architecture (React 19 + Vite)

### 3.1 Design Principles
- **Composition Over Inheritance**: Components are structured as modular, self-contained functional blocks.
- **Strict Separation of Concerns**:
  - **Presentational Components**: Pure UI components styled with Tailwind CSS (`/src/components`).
  - **Custom Hooks**: Encapsulate reusable logic and side effects (`/src/hooks`).
  - **Server State**: Managed exclusively by **TanStack Query** with automated cache invalidation.
  - **Client State**: Managed by **Zustand** for UI preferences, drawer states, and user sessions.

### 3.2 Performance Optimization
- **Code Splitting & Lazy Loading**: Route-level and component-level code splitting via React 19 `React.lazy` and Suspense.
- **Asset & Image Optimization**: Responsive image sizing, WebP/AVIF formats, and lazy rendering for product grids.
- **Bundle Budgets**: Strict dependency auditing to prevent monolithic client bundles.

---

## 4. Backend Architecture (Express.js + TypeScript)

### 4.1 Layered Clean Architecture
Our backend isolates responsibilities into distinct architectural layers:
1. **Controllers (`/src/server/controllers`)**:
   - Handle incoming HTTP requests and responses.
   - Perform request schema validation using **Zod**.
   - Delegate business logic entirely to the Service Layer.
2. **Services (`/src/server/services`)**:
   - Contain domain and business logic (e.g., pricing rules, tax calculations, order fulfillment).
   - Independent of HTTP transport details.
3. **Data Access Layer / Prisma ORM (`/src/server/db`)**:
   - Executes parameterized queries against PostgreSQL.
   - Implements repositories and transactional boundaries.

### 4.2 Caching & Async Processing
- **Redis Caching**: Caches high-frequency read endpoints (e.g., product catalogs, localization dictionaries, exchange rates) with configurable TTLs.
- **BullMQ Job Queues**: Offloads asynchronous tasks (e.g., exchange rate synchronization, order confirmation emails, inventory alerts) to background worker processes.

---

## 5. Security & Governance
- **Authentication**: Stateless JSON Web Tokens (JWT) with secure, HttpOnly refresh tokens.
- **Authorization**: Role-Based Access Control (RBAC) separating Customers, Merchandisers, and Platform Administrators.
- **Input Validation**: Strict schema enforcement on all API inputs using Zod to prevent injection and malformed payloads.
- **OWASP Compliance**: Headers protection via Helmet, rate limiting, and CORS restrictions.

---

## 6. Domain-Driven Design (DDD) & Bounded Contexts

To prevent enterprise complexity from eroding architectural boundaries, the backend business logic is partitioned into explicit **Bounded Contexts** following Domain-Driven Design (DDD) principles. Each context encapsulates its own ubiquitous language, domain entities, aggregate roots, and transactional consistency boundaries.

```
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

### 6.1 Core Bounded Contexts & Aggregate Roots
1. **Catalog & Merchandising Context**
   - **Aggregate Root**: `Product` (Saree SKU).
   - **Entities & Value Objects**: `ProductVariant`, `ProductImage`, `ProductAttribute`, `SilkMarkLicense`, `ZariPurityGrade`.
   - **Responsibility**: Curating saree storytelling, weaving specifications, regional cluster profiles, and pricing tiers.
2. **Inventory & Warehouse Context**
   - **Aggregate Root**: `Inventory` & `Warehouse`.
   - **Entities**: `InventoryTransaction`, `StockHoldReservation`.
   - **Responsibility**: Tracking physical 1-of-1 unique saree availability, loom re-weave schedules, and real-time stock holds.
3. **Order Management System (OMS) & Checkout Context**
   - **Aggregate Root**: `Order`.
   - **Entities**: `OrderItem`, `Payment`, `Shipment`, `TaxRule`, `ShippingRule`.
   - **Responsibility**: Managing multi-currency checkout, GST/VAT tax calculation, payment capture, and DDP fulfillment lifecycle.
4. **Customer & Loyalty Context**
   - **Aggregate Root**: `User`.
   - **Entities**: `Address`, `Wishlist`, `Review`, `RefreshToken`.
   - **Responsibility**: Authentication, RBAC governance, heirloom wishlist curation, and bridal preference profiles.
5. **Localization & Currency Context**
   - **Aggregate Root**: `Country` & `Currency`.
   - **Entities**: `ExchangeRate`, `Language`, `TranslationEntry`.
   - **Responsibility**: Maintaining live currency conversion ledgers and regional GST/VAT tax percentages.

### 6.2 Context Integration & Anti-Corruption Layers (ACL)
- **Shared Kernel**: Zod domain schemas (`/src/shared/schemas`) act as the shared contract across contexts.
- **Anti-Corruption Layer (ACL)**: When the OMS interacts with external payment gateways (Stripe, Razorpay) or logistics providers (DHL, Blue Dart), an ACL adapter translates external payloads into internal domain entities to prevent external model leakage.

---

## 7. Enterprise Event-Driven Architecture & Asynchronous Messaging

To decouple high-frequency transactional mutations from downstream side effects, the platform implements an **Event-Driven Architecture** utilizing Redis Pub/Sub and **BullMQ** persistent job queues.

```
+------------------+         +------------------+         +--------------------+
|  Order Checkout  | --(1)-->|  Domain Event    | --(2)-->|    BullMQ Redis    |
|   Service Ctx    |         |  order.created   |         |    Event Broker    |
+------------------+         +------------------+         +--------------------+
                                                                    |
                +-------------------------+-------------------------+
                |                         |                         |
                v                         v                         v
       +------------------+      +------------------+      +------------------+
       | Email/WhatsApp   |      | Inventory Hold   |      | AI Concierge     |
       | Notification Q   |      | Confirmation Q   |      | Preference Sync  |
       +------------------+      +------------------+      +------------------+
```

### 7.1 Canonical Domain Events Taxonomy
All domain events follow a versioned JSON schema wrapped in a standardized event envelope:
- `order.created` (v1): Fired when a customer initiates checkout.
- `inventory.reserved` (v1): Fired when a 1-of-1 saree is locked for 15 minutes.
- `payment.captured` (v1): Fired upon Stripe/Razorpay webhook verification.
- `saree.stock_replenished` (v1): Fired when an artisan completes a new weave or a hold expires.
- `currency.rates_updated` (v1): Fired when OpenExchangeRates synchronization finishes.

### 7.2 Transactional Outbox Pattern & Idempotency
- **Transactional Outbox**: To guarantee at-least-once delivery without distributed transactions, domain mutations write event records to a PostgreSQL `OutboxMessage` table within the same ACID database transaction. A background worker polls and publishes outbox messages to BullMQ.
- **Idempotency Keys**: Consumers enforce idempotent processing by recording `eventId` signatures in Redis (`idempotency:event:{eventId}`). Duplicate webhooks or re-delivered queue jobs are discarded silently without duplicating emails or inventory subtractions.
