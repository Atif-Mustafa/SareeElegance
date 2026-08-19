# Changelog

All notable changes to the enterprise e-commerce platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---




## [Unreleased] - PR 8: Inventory Strategy and Real-Time Locks
- **Authoritative Inventory**: Implemented a standalone inventory domain separated from cart pricing constraints. Added `Inventory` and `Reservation` models with SKU-level lock boundaries.
- **Concurrency Oversell Protection**: Implemented atomic `FOR UPDATE` transaction locks via `inventoryRepository` to guarantee exact available quantities under high concurrency.
- **Fail-Closed Guarantees**: Forced database errors (`INFRA_001`) instead of dummy availability when the PostgreSQL server is unreachable.
- **Idempotent Reservations**: Implemented robust hold expiration and release flows preventing double-releases from corrupting available balances.
- **Integration Testing**: Validated locking mechanisms with real PostgreSQL concurrency tests, proving single-unit allocation and oversell blocking.

## [Unreleased] - PR 7.1: Cart Authority Hardening & Fail-Closed Pricing
- **Fail-Closed Cart UI**: Refactored checkout and drawer flows to explicitly block user progression when authoritative subtotals are unavailable, replacing legacy local calculations with an unverified pending state.
- **Strict Money Invariants**: Removed all vulnerable `Number()` usages mapping BigInt representations; state managers now persist unmutated `Money` structures directly from the API.
- **Stateless Validation**: Implemented protective 999-unit bounds checking and explicit 503 `INFRA_001` error emission when the backing database becomes unavailable.
- **Mixed-Currency Resolution**: Prevented cross-currency exploitation by hardening `CartService` to reject cart totals containing multiple currencies (`CART_CURRENCY_MISMATCH`).

## [Unreleased] - PR 7: Server-Authoritative Cart Validation
- Created shared Cart contracts (`cart-request.ts`, `cart-response.ts`) with `BigInt` math precision for strict minor-unit representation.
- Built stateless `POST /api/v1/cart/validate` endpoint to enforce server-authoritative catalog pricing.
- Integrated `CartService` with `CatalogRepository` to securely fetch and validate product existence, ACTIVE status, and cross-currency consistency without falling back to client-submitted prices.
- Updated `useStore.ts` and frontend cart drawer/checkout interfaces to consume validated server subtotals instead of local `priceINR` derivatives, with `stale` state tracking upon quantity adjustments.
- Added comprehensive Vitest unit testing suites to `server/tests/unit/cart/cart.service.test.ts` asserting minor-unit subtotals and duplicate line merges.

## [Unreleased]
### Changed
- **Catalog Frontend Hardening**: The frontend catalog integration (PLP and PDP) is now strictly API-driven. Runtime mocks have been completely removed from storefront flows.
- **Race Safety**: Added `ignore` abort patterns to React `useEffect` hooks in PLP, PDP, and HomePage to prevent state updates on unmounted components and race conditions from rapidly changing routes or filters.
- **Money Handling**: Upgraded legacy `Product` type with `priceMinor` and `currency` fields. Stop-gap `priceINR` is retained as a view-model bridge but deprecated for any calculation.
- **Inventory Semantics**: Removed fabricated `inStock` and `stockCount` data from the DTO mapper. The frontend now gracefully omits or handles missing authoritative inventory data without fabricating assumptions.
- **Vite Proxy**: Documented that the Vite proxy for `/api` is for development only, expecting a same-origin production deployment.
 - PR 5: Read-Only Catalog API Foundation

### Added
- Created shared, runtime-neutral Catalog DTOs (`CatalogProductSummary`, `CatalogProductDetail`, `CatalogCategoryDto`).
- Implemented `CatalogMapper` to strictly map Prisma objects to DTOs, ensuring BigInt fields (like `priceMinor`) are converted to string explicitly without precision loss.
- Added repository and service layers for reading catalog records.
- Implemented `GET /api/v1/products` exposing a paginated, filterable list of active products.
- Implemented `GET /api/v1/products/:slug` exposing full product detail for active products.
- Implemented `GET /api/v1/categories` exposing all active categories.
- Enforced strict lifecycle visibility: `DRAFT` and `ARCHIVED` products return 404 or are omitted.
- Validated public queries with Zod to prevent arbitrary filter/sort injection.
- Resolved deterministic primary media selection for products.


## [Unreleased] - PR 5: Read-Only Catalog API Foundation

### Added
- Created shared, runtime-neutral Catalog DTOs (`CatalogProductSummary`, `CatalogProductDetail`, `CatalogCategoryDto`).
- Implemented `CatalogMapper` to strictly map Prisma objects to DTOs, ensuring BigInt fields (like `priceMinor`) are converted to string explicitly without precision loss.
- Added repository and service layers for reading catalog records.
- Implemented `GET /api/v1/products` exposing a paginated, filterable list of active products.
- Implemented `GET /api/v1/products/:slug` exposing full product detail for active products.
- Implemented `GET /api/v1/categories` exposing all active categories.
- Enforced strict lifecycle visibility: `DRAFT` and `ARCHIVED` products return 404 or are omitted.
- Validated public queries with Zod to prevent arbitrary filter/sort injection.
- Resolved deterministic primary media selection for products.

## [Unreleased] - PR 4: Catalog Domain Schema Foundation

### Added
- Created foundational Prisma schema for the Catalog domain (`prisma/schema.prisma`).
- Defined `Product` model as the primary catalog entity with internal ID, SKU, slug, name, descriptions, canonical `priceMinor` (BIGINT), `currency`, SEO metadata, status, and audit timestamps.
- Enforced strict uniqueness on `sku` and `slug`.
- Created `Category` model supporting hierarchical taxonomy and active status.
- Implemented `SareeDetails` as a one-to-one relation to `Product` to isolate ethnic/saree-specific textile attributes (fabric, weave, zari, motif, artisan, certifications, dimensions).
- Created `ProductMedia` for media references (IMAGE/VIDEO, primary flag, sorting).
- Created lightweight `ProductColor` and `ProductOccasion` models for faceted search dimensions without over-engineering complex taxonomies.
- Generated and successfully applied the first meaningful database migration (`catalog_foundation`) against a real PostgreSQL instance.
- Verified schema integrity and database behavior via integration tests in `server/tests/integration/catalog-schema.test.ts`.
- Added tests to ensure BIGINT canonical prices persist correctly and duplicate SKUs are rejected by database constraints.
- Explicitly maintained bounded contexts: NO inventory, NO users/auth, NO orders, and NO carts were modeled in this PR.

## [Unreleased] - PR 3.1: Real PostgreSQL Connectivity Verification

### Added
- Created `server/tests/integration/database-connectivity.test.ts` for real PostgreSQL connection verification.
- Implemented `test:db` script to run database integration tests securely.
- Guarded real database integration tests behind explicit `TEST_DATABASE_URL` opt-in to avoid blocking local builds.
- Ensured skipped status for integration tests when running in `production` environment or without a real database instance.
- Verified connection string, `SELECT 1` readiness query, and graceful disconnect path via real integration tests (currently marked as partially verified pending real environment database).

---

## [Unreleased] - PR 3: Prisma + PostgreSQL Tooling Foundation

### Added
- Initialized Prisma ORM configuration (`prisma/schema.prisma`, `prisma.config.ts`) using the installed Prisma 7 syntax.
- Configured PostgreSQL connection via `@prisma/adapter-pg` driver adapter.
- Configured secure server-only `DATABASE_URL` environment variable using Zod validation.
- Created `PrismaService` singleton for database lifecycle management and graceful shutdown.
- Added database readiness check endpoint `GET /api/v1/health/ready` verifying connection with a safe `SELECT 1` query.
- Added test coverage for database readiness scenarios using Vitest mocks.
- Added database tooling scripts (`db:generate`, `db:validate`, `db:format`, `db:migrate:dev`, `db:migrate:deploy`).

---

## [Unreleased] - PR 2: Repository Structural Segregation

### Changed
- Restructured repository layout into top-level architectural boundaries:
  - `client/`: Browser-only React 19 application (`client/src/app`, `components`, `pages`, `store`, `styles`, `types`, `lib`, `data`).
  - `server/`: Express backend (`server/src/app.ts`, `server.ts`, `config/`, `common/middleware/`, `modules/health/`, `types/`, `tests/integration/`).
  - `shared/`: Runtime-neutral boundary for shared schemas, contracts, and constants.
  - `tests/e2e/`: Reserved directory for future end-to-end testing suite.
  - `scripts/`: Reserved directory for operational and automation scripts.
- Refactored build and TypeScript configurations:
  - Configured `tsconfig.base.json`, `tsconfig.client.json`, `tsconfig.server.json`, and root `tsconfig.json`.
  - Updated `vite.config.ts` with `root: 'client'`, `outDir: '../dist'`, and `@client`, `@server`, `@shared` path aliases.
  - Updated `vitest.config.ts` to discover tests in `server/tests/`.
  - Updated `package.json` with `typecheck:client`, `typecheck:server`, `dev:client`, `dev:server`, `test:server`, and isolated `lint` script.

---

## [Unreleased] - PR 1: Minimal Express API Foundation

### Added
- Implemented minimal Express API foundation in `src/server/`:
  - `src/server/app.ts`: Express application factory with disabled `x-powered-by`, 100kb JSON body parser, request ID middleware, `/api/v1/health` route, 404 handler, and RFC 7807 error handler.
  - `src/server/server.ts`: Express server listener on `env.PORT` with graceful shutdown handling.
  - `src/server/config/env.ts`: Strict environment schema validation via Zod (`NODE_ENV`, `PORT`, `CLIENT_ORIGIN`).
  - `src/server/middleware/requestId.ts`: Request ID middleware preserving valid `X-Request-ID` or generating UUID v4 for tracking.
  - `src/server/middleware/notFound.ts`: 404 Not Found handler returning RFC 7807 `application/problem+json`.
  - `src/server/middleware/errorHandler.ts`: Centralized 500 error handler returning safe RFC 7807 problem details without stack traces or sensitive data leaks.
  - `src/server/routes/health.routes.ts`: `GET /api/v1/health` endpoint returning ISO 8601 UTC timestamp and request ID.
  - `src/server/tests/health.test.ts`: Supertest unit and integration test suite covering health responses, request IDs, 404 errors, and 500 error safety.
  - `tsconfig.server.json` & `vitest.config.ts`: Isolated TypeScript configuration and Vitest test runner setup for server execution.

---

## [Unreleased] - Enterprise Architecture Completion

### Changed
- `DESIGN_SYSTEM.md`: Revised to reflect verified repository state. Updated fonts to `Cormorant Garamond` and `Plus Jakarta Sans`. Deferred Radix UI adoption. Introduced generic `Money` contract. Added decision statuses.
- `NOTIFICATIONS.md`: Transitioned to provider-neutral adapter architecture. Deferred WebSockets in favor of SSE/Polling. Elaborated on durable idempotency in PostgreSQL, fallback rules, and template governance. Added decision statuses.
- `OBSERVABILITY.md`: Adopted W3C tracing standards (`traceparent`). Separated operational from business metrics. Defined phased OpenTelemetry adoption and safe Redis runbooks. Added decision statuses.
- `API_SPEC.md`: Expanded with Request Tracing headers, Rate Limiting, Cursor Pagination, Filtering conventions, and Idempotency key policies.
- `DEVELOPMENT_GUIDELINES.md`: Appended Engineering Governance section covering module boundaries, naming conventions, Conventional Commits, PR Code Review Checklist, and Definition of Done (DoD).
- `SEARCH.md`: Added Search Ranking Detail outlining proposed relevancy weights, typo tolerance, stemming rules, zero-result fallback strategy, and search quality KPIs.

### Added
- Completed enterprise architecture specifications covering missing domain, integration, and compliance rules:
  - `DOMAIN_ARCHITECTURE.md`: Explicitly defined Modular Monolith bounded contexts, aggregate roots, anti-corruption layers, and module isolation rules.
  - `EVENTS.md`: Outlined Event-Driven Architecture, BullMQ background jobs, standard event envelopes, transactional outbox pattern, and idempotency guarantees.
  - `CACHING.md`: Formalized multi-layer caching hierarchy, Redis cache-aside policies, stampede protection (XFetch), and invalidation triggers.
  - `AUDIT_LOGGING.md`: Defined tamper-resistant `SecurityAuditLog` schemas, PII minimization, retention rules, and alerting triggers for suspicious administrative actions.
  - `ERROR_CATALOG.md`: Established RFC 7807 error schema and enterprise error taxonomy mapped by bounded context (e.g., `CHECKOUT_001`, `VALIDATION_001`).
  - `FEATURE_FLAGS.md`: Created lightweight PostgreSQL/Redis-backed feature flag engine for progressive delivery, kill switches, and percentage rollouts.
  - `ANALYTICS.md`: Defined standardized GA4 event taxonomy (`product_viewed`, `payment_completed`), consent-aware tracking, and server-side strict metrics.
  - `PAYMENTS.md`: Specified provider-neutral backend-authoritative payment intent lifecycle, webhook idempotency, and Razorpay/Stripe isolation.
  - `INVENTORY_RESERVATION.md`: Documented critical 1-of-1 saree inventory locking, optimistic concurrency row locking, 15-minute expiration timers, and worker recovery.
  - `RECOMMENDATIONS.md`: Formalized phased recommendation strategy (Deterministic Rules -> Behavioral -> pgvector Semantic AI) with cold-start heuristics.
  - `MEDIA_PIPELINE.md`: Upgraded image pipeline to full media pipeline with secure pre-signed uploads, video transcode, HLS streaming, EXIF stripping, and watermarking.
  - `PRIVACY_COMPLIANCE.md`: Added DPDP/GDPR compliance rules, "Right to be Forgotten" anonymization sagas, Cookie Consent, and Data Breach incident workflows.
  - `DISASTER_RECOVERY.md`: Defined RPO/RTO objectives and standard incident response runbooks for payment, redis, and data breach SEV-1/SEV-2 events.
  - `DESIGN_SYSTEM.md`: Consolidated the "Heirloom Ivory" aesthetic mandate, Tailwind token mapping, and accessible component library rules.
  - `NOTIFICATIONS.md`: Architected decoupled omnichannel dispatch (Email, WhatsApp, SMS) via BullMQ with luxury MJML templates.
  - `OBSERVABILITY.md`: Detailed distributed tracing (`X-Trace-Id`), Pino structured logging, and Prometheus SLI alerting.
  - `adr/README.md`: Created Architecture Decision Records (ADR) repository and logged ADR-001 through ADR-008.

---


## [Unreleased] - Shared Contracts Layer
- **Refactor**: Created a runtime-neutral `shared/` package for contracts utilized by both `client/` and `server/`.
- **Contracts**: Defined canonical representations for Money (`amountMinor`), Currency, API Envelopes (`ApiSuccess`, `ApiProblem`, `ApiPaginatedSuccess`), Pagination, Request IDs, and standard Error Codes.
- **Middleware**: Migrated Express error handlers and health route to use shared API envelopes and error codes.
- **Validation**: Added isomorphic Zod schema for Money validation.
- **Constraint**: Documented the strict boundary preventing Prisma models from leaking into shared contracts or the client.

## [Unreleased] - Phase 2: Enterprise Localization, Currency & Country System
- Implement PostgreSQL tables via Prisma for `Country`, `Language`, `Currency`, `ExchangeRate`, and `TranslationEntry`.
- Create REST API endpoints (`GET /api/v1/localization/config`, `GET /api/v1/localization/translations/:locale/:namespace`, `GET /api/v1/currencies/rates`) with Redis caching.
- Build BullMQ background worker to synchronize currency exchange rates automatically every 6 hours.
- Enable dynamic RTL layout switching (`dir="rtl"`, logical Tailwind CSS properties) for Urdu and Arabic.
- Implement responsive Country & Language Switcher modal in store header and footer.

---

## [0.5.0] - 2026-08-15 - PR 8: Inventory Strategy and Real-Time Locks
### Added & Upgraded
- Implemented robust Inventory & Warehouse Context using DDD principles.
- Added `Inventory` and `Reservation` models in Prisma with robust `FOR UPDATE` transactional locking to prevent overselling.
- Built `inventory.repository.ts` with strict database atomic operations for reserving and releasing inventory.
- Created explicit API endpoints for inventory availability, reservation, and release.
- Added unit and concurrency-focused integration tests to ensure race conditions are prevented.
- Integrated frontend `useInventory` hook on the Product Detail Page to block the cart button when a product is `OUT_OF_STOCK`.
- Updated documentation (DOMAIN_ARCHITECTURE.md, API_SPEC.md).

## [0.5.0] - 2026-08-18 - PR 11: Order Lifecycle, Customer Confirmation, and Fulfillment Handoff

### Added
- Implemented authoritative `getOrderSecure` logic using a secure, opaque `accessToken` for guest retrieval.
- Created `OrderConfirmationPage` (`/client/src/pages/OrderConfirmationPage.tsx`) for a read-only authoritative view.
- Added `cancelOrder` API allowing cancellation of orders in `PAYMENT_PENDING` or `CONFIRMED` states, integrating with the new `InventoryService.restoreConsumedInventory` for exact rollback.
- Added `prepareFulfillment` API to transition confirmed orders to `READY_FOR_FULFILLMENT`, locking out future cancellations and emitting `FulfillmentHandoff` records.
- Updated Prisma schema to include `accessToken` on `Order`, `FulfillmentHandoff`, `ConfirmationDelivery`, and `OrderStatusHistory` for complete post-payment lifecycle auditing.

---

## [0.4.0] - 2026-08-03 - Complete Architectural Review & Luxury Saree Enterprise Specification Upgrade

### Added & Upgraded
- Performed an exhaustive architectural review across all `/docs` specifications to establish an enterprise-grade luxury saree e-commerce platform comparable to Shopify Plus, Nykaa Fashion Luxe, Tanishq, and Apple Store:
  - `PRODUCT_REQUIREMENTS.md`: Upgraded with brand vision, buyer personas (modern bride, heirloom collector, NRI gifter), saree catalog taxonomy (Katan, Kanchipuram, Chanderi), weaving techniques (Kadwa, Jamdani, Tanchoi), anatomy of a saree (Jamin, Kinar, Pallu, Blouse, Zari purity), and DDP international shipping NFRs.
  - `DATABASE.md`: Extended 3NF schema matrix with 30+ normalized entities (`Product`, `ProductVariant`, `ProductImage`, `ProductVideo`, `ProductAttribute`, `Category`, `Collection`, `Fabric`, `Weave`, `Technique`, `Occasion`, `ColorFamily`, `Border`, `Pallu`, `Blouse`, `Pattern`, `Motif`, `CareInstruction`, `Artisan`, `Region`, `Warehouse`, `Inventory`, `InventoryTransaction`, `Coupon`, `TaxRule`, `ShippingRule`, `Address`, `Review`, `Rating`, `Wishlist`, `Cart`, `Order`, `Payment`, `Shipment`, `Return`, `Notification`) with audit fields, optimistic concurrency (`version`), and soft delete rules.
  - `SECURITY.md`: Defined Zero Trust architecture, stateless JWT access + SHA-256 hashed HttpOnly refresh token rotation, RBAC/ABAC ownership guards, Helmet CSP hardening, Redis rate limiting, and immutable PostgreSQL security audit logs (`SecurityAuditLog`).
  - `SEO.md`: Documented international multi-regional SEO (`hreflang` matrix across `en-in`, `hi-in`, `ur-in`, `en-us`, `en-gb`), URL canonicalization parameter stripping, Schema.org JSON-LD microdata (`Product`, `BreadcrumbList`, `Organization`, `FAQPage`), and automated XML sitemaps.
  - `CMS.md`: Designed decoupled headless CMS architecture supporting `HeroBanner`, `PromotionalRibbon`, `HeritageStory` weaving editorials, and modular dynamic campaign blocks (`HERO_SPLIT_BANNER`, `WEAVE_SPOTLIGHT`, `ARTISAN_QUOTE`, `CURATED_SAREE_GRID`, `LOOM_VIDEO_EMBED`) with instant Redis pattern cache invalidation.
  - `AI.md`: Engineered server-side Google Gemini API (`@google/genai`) integration for AI Bridal Concierge (`/api/v1/ai/concierge`), multi-modal motif matching (`/api/v1/ai/visual-search`), vector embedding saree recommendations (`pgvector`), and order tracking support.
  - `SEARCH.md`: Specified hybrid PostgreSQL GIN full-text search + Elasticsearch sync, 7-dimension multi-attribute faceted navigation (Fabric, Weave, Motif, Color, Zari Grade, Occasion, Price), typo tolerance, and synonym dictionaries (`Banarsi` ↔ `Banarasi`, `Kanjeevaram` ↔ `Kanchipuram`).
  - `PERFORMANCE.md`: Established strict SLAs (LCP < 1.8s, INP < 100ms, CLS < 0.05), React 19 lazy loading bundle budgets (< 140 KB vendor, < 60 KB route), WebP/AVIF CDN delivery with shimmer skeleton aspect ratios, and 5-layer caching hierarchy (Browser, TanStack Query, CDN, Redis, PgBouncer).
  - `ADMIN.md`: Architected secure `/admin/*` portal with RBAC permissions matrix, executive D3/Recharts GMV/AOV dashboard, saree attribute editor, 1-of-1 unique saree tracking, Order Management System (OMS) with GST/VAT invoice PDF generation, and localization control center.
  - `TESTING.md`: Expanded QA testing pyramid covering Vitest + React Testing Library unit tests, Supertest API/Prisma transaction tests, Playwright E2E buyer & admin journeys, `@axe-core/playwright` WCAG 2.1 AA accessibility audits, visual regression snapshots, and k6 load testing (200 VUs, p95 < 150ms).
  - `DEPLOYMENT.md`: Configured multi-stage Docker builds (< 120 MB non-root runtime container), GitHub Actions CI/CD DevSecOps pipeline, Kubernetes rolling & blue-green zero-downtime deployment strategies, HPA auto-scaling, and Pino/Sentry/Prometheus observability.
  - `ROADMAP.md`: Mapped enterprise roadmap across Phase 0 (Foundation MVP), Phase 1 (Enterprise Core & Localization), Phase 2 (AI Concierge & Advanced Merchandising), and Phase 3 (Blockchain Silk Mark Provenance & Omnichannel POS).

---

## [0.3.0] - 2026-08-02 - Enterprise Architecture Documentation Expansion

### Added
- Created complete enterprise documentation suite in `/docs` adhering strictly to Clean Architecture, SOLID, OWASP Top 10, WCAG 2.1 AA, and PCI-DSS standards:
  - `ARCHITECTURE.md`: High-level system design, React 19 + Express.js layered architecture, and Nginx/CDN ingress.
  - `ROADMAP.md`: Multi-phase product & engineering roadmap from foundational UI to global scale.
  - `DEVELOPMENT_GUIDELINES.md`: SOLID, DRY, KISS, and YAGNI engineering standards and reuse-first mandate.
  - `DATABASE.md`: PostgreSQL schema conventions, audit fields, soft deletes, and localization tables.
  - `API_SPEC.md`: REST API conventions, standard JSON response payloads, error governance, and localization endpoints.
  - `LOCALIZATION.md`: `i18next` backend-driven translation flow, preference synchronization hierarchy, and RTL layout engine.
  - `TESTING.md`: Quality assurance testing pyramid covering Vitest, Playwright E2E, axe-core A11y, and k6 load testing.
  - `DEPLOYMENT.md`: Docker Compose multi-container topology, CI/CD GitHub Actions pipelines, environment variable governance, and Sentry/Prometheus observability.
  - `PRODUCT_REQUIREMENTS.md`: Executive PRD defining target audiences, core storefront features, admin capabilities, and SLAs.
  - `SECURITY.md`: Zero Trust security architecture, JWT stateless access/refresh cookie protocol, RBAC/ABAC authorization, OWASP Top 10 mitigations, and PCI-DSS compliance.
  - `CMS.md`: Headless CMS content engine, hero banners, promotional ribbons, heritage saree storytelling schemas, and Redis cache invalidation.
  - `AI.md`: Server-side Google Gemini API integration, styling & drape concierge (`/api/v1/ai/concierge`), visual motif matching, and multilingual SEO translation assistant.
  - `SEO.md`: Multi-regional international SEO (`hreflang`), dynamic canonicalization, Schema.org JSON-LD microdata (`Product`, `BreadcrumbList`), and dynamic XML sitemaps.
  - `PERFORMANCE.md`: Performance SLAs (LCP < 1.8s, INP < 100ms), React 19 lazy loading bundle budgets, WebP/AVIF image delivery, and multi-layer caching hierarchy.
  - `SEARCH.md`: Hybrid search engine model (PostgreSQL FTS + Elasticsearch), multi-attribute faceted navigation, typo tolerance, and synonym dictionaries.
  - `ADMIN.md`: Enterprise Admin Portal architecture, RBAC permissions matrix, catalog/OMS management, and PostgreSQL security audit logs.
  - `CODING_STANDARDS.md`: Mandatory TypeScript strictness rules, React functional component standards, Express layered separation, naming conventions, and PR checklists.
  - `CHANGELOG.md`: Versioned log of enterprise architecture decisions and feature milestones.

---

## [0.2.0] - 2026-08-01 - Phase 1: Core Storefront Architecture & UX Polish

### Added
- Implemented `ProductCardSkeleton` and `ProductGridSkeleton` components with shimmer animation sweep in `/src/components/product/ProductCardSkeleton.tsx`.
- Integrated loading skeleton states into Product Listing Page (`/src/pages/PLP.tsx`) during filter selection and category transitions.
- Integrated skeleton loaders into Home Page (`/src/pages/HomePage.tsx`) bestseller filtering and Product Detail Page (`/src/pages/PDP.tsx`) related product carousels.

### Changed
- Standardized Tailwind CSS `@keyframes shimmer` animation in `/src/index.css`.
- Refined responsive grid layouts across PLP (supporting 2-column mobile and 4-column desktop toggles).

---

## [0.1.0] - 2026-07-15 - Initial Foundation Release

### Added
- Initial project scaffolding with React 19 + TypeScript + Vite frontend and Node.js LTS + Express.js backend.
- Zustand global store (`/src/store/useStore.ts`) for shopping cart, wishlist, and modal state management.
- Complete heritage saree catalog mock data and initial UI components for Home, PLP, PDP, Cart, Checkout, and Heritage stories.

## [PR 11.1] Lifecycle Verification & Persistence Hardening

### Added
- Added focused `order-lifecycle.test.ts` covering valid access, idempotent cancellation, exact restoration, reconciliation, and concurrency.
- Added `RESTORED` status to `ReservationStatus` enum to safely mark consumed reservations that have been released via order cancellation.

### Changed
- Concurrency hardened: `cancelOrder` and `prepareFulfillment` now use row-level `FOR UPDATE` PostgreSQL locking to prevent race conditions.
- Access token hardened: `order.accessToken` is now securely hashed with SHA-256 before storage. The raw access token is returned exactly once during order confirmation.
- Database hardened: Added indexing on `Order.status` and `Reservation.status`. Confirmed existing constraints (`FulfillmentHandoff.orderId` unique, `Order.orderNumber` unique).

## [1.2.0] - 2026-08-19 (PR 12)
### Added
- Shipping module and `Shipment` entity with its own lifecycle (`CREATED`, `DISPATCHED`, `IN_TRANSIT`, `DELIVERED`, `FAILED`, `CANCELLED`).
- `MockShippingProvider` for deterministic testing of shipping workflows.
- `/api/v1/orders/:id/shipment` endpoint for secure tracking retrieval (requires access token).
- `/api/v1/shipping/webhook` endpoint for provider webhook processing.
- Idempotency and stale-event protection for shipping webhooks.
- Frontend: Order Confirmation Page updated to render authoritative shipment data.

### Changed
- Order status remains focused on commercial lifecycle, while Shipment handles execution and tracking.
- `FulfillmentHandoff` snapshot is consumed for shipment creation instead of reconstructing data from the catalog.
