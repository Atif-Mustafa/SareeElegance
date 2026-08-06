# Changelog

All notable changes to the enterprise e-commerce platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [Unreleased] - Phase 2: Enterprise Localization, Currency & Country System
- Implement PostgreSQL tables via Prisma for `Country`, `Language`, `Currency`, `ExchangeRate`, and `TranslationEntry`.
- Create REST API endpoints (`GET /api/v1/localization/config`, `GET /api/v1/localization/translations/:locale/:namespace`, `GET /api/v1/currencies/rates`) with Redis caching.
- Build BullMQ background worker to synchronize currency exchange rates automatically every 6 hours.
- Enable dynamic RTL layout switching (`dir="rtl"`, logical Tailwind CSS properties) for Urdu and Arabic.
- Implement responsive Country & Language Switcher modal in store header and footer.

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
