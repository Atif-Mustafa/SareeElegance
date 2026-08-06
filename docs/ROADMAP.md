# Enterprise Engineering & Product Roadmap — Luxury Heritage Saree Platform

---

## 1. Executive Summary & Strategic Phasing
This roadmap outlines the multi-phase engineering architecture, feature delivery milestones, technical debt remediation, and long-term extensibility for our luxury saree e-commerce platform. Designed to scale from an MVP digital flagship to a global omnichannel market leader, each sprint prioritizes architectural resilience, zero-regression quality, and cultural authenticity.

---

## 2. Milestone Breakdown & Engineering Sprints

```
+---------------------------------------------------------------------------------+
|                         ENTERPRISE STRATEGIC ROADMAP                            |
|                                                                                 |
|  [Phase 0: Foundation MVP]       -> Clean Architecture, Core Catalog, Cart, INR |
|  [Phase 1: Enterprise Core]      -> Multi-Currency, Localization, Redis, RBAC   |
|  [Phase 2: Luxury Concierge]     -> AI Drape Advisor, Visual Search, Custom OMS |
|  [Phase 3: Global Omnichannel]   -> Blockchain Silk Mark, Warehouse B2B, AR     |
+---------------------------------------------------------------------------------+
```

### 2.1 Phase 0: Foundation & MVP Flagship (Completed / Stable)
- **Objective**: Establish production-ready React 19 + Express.js + Vite full-stack foundation with accessible UI primitives and baseline saree catalog.
- **Key Deliverables**:
  - Semantic HTML5 storefront views (Home, Saree Category PLP, Saree PDP, Shopping Cart, Heritage Storytelling articles).
  - Zustand client state management for Cart and Wishlist with local persistence.
  - Tailwind CSS luxury design system ("Heirloom Ivory" warm neutral palette, Playfair Display + Plus Jakarta Sans typography).
  - Vitest + React Testing Library unit test suite for saree price formatting and cart arithmetic.

### 2.2 Phase 1: Enterprise Core, Localization & Multi-Currency (In Progress / Next Sprint)
- **Objective**: Transform standard storefront into an international, multi-locale, multi-currency luxury platform.
- **Key Deliverables**:
  - **Relational Schema Enhancement**: Deploy normalized PostgreSQL tables via Prisma (`Country`, `Language`, `Currency`, `ExchangeRate`, `TranslationEntry`).
  - **Dynamic Localization Engine**: Replace static dictionary with `i18next` backend-driven translations, RTL layout switching for Urdu/Arabic, and automated currency conversion (`INR` ↔ `USD`, `GBP`, `EUR`, `AED`, `SGD`).
  - **Redis Edge Caching & Background Jobs**: Integrate BullMQ background worker to synchronize OpenExchangeRates every 6 hours and cache public CMS banners in Redis (`1800s` TTL).
  - **Enterprise Admin Portal MVP**: Build secure `/admin` dashboard with RBAC guards (`SUPER_ADMIN`, `MERCHANDISER`) for catalog editing and manual exchange rate overrides.

### 2.3 Phase 2: AI Luxury Concierge & Advanced Merchandising (Q4 2026)
- **Objective**: Differentiate brand through AI-driven bridal styling, visual discovery, and custom blouse tailoring.
- **Key Deliverables**:
  - **AI Bridal Concierge (`/api/v1/ai/concierge`)**: Integrate Google Gemini API (`gemini-2.5-flash`) with Redis session memory to provide regional draping advice and wedding lookbook recommendations.
  - **Visual Search & Motif Matcher**: Enable image upload search for sarees matching wedding moodboard palettes and traditional weave patterns.
  - **Blouse Customizer Engine**: Add interactive blouse measurement configurator (neckline, sleeves, pico/fall options) to PDP and Cart items.
  - **Hybrid FTS Search Engine**: Upgrade PostgreSQL full-text search with multi-attribute faceted aggregation (Fabric, Weave Technique, Zari Purity, Color Family).

### 2.4 Phase 3: Global Omnichannel & Blockchain Provenance (Q1–Q2 2027)
- **Objective**: Establish global DDP logistics and blockchain-verified heirloom authenticity.
- **Key Deliverables**:
  - **Silk Mark Blockchain QR Verification**: Link Silk Mark license numbers on saree tags to an immutable provenance certificate viewer.
  - **Omnichannel Store & Warehouse POS**: Real-time inventory sync across Varanasi heritage vaults, flagship retail boutiques, and online reservations.
  - **AR Drape Try-On**: WebGL / Augmented Reality viewer enabling customers to preview saree drape color contrast against their skin undertone.

---

## 3. Technical Debt & Continuous Refactoring Schedule

To prevent architectural degradation as the codebase expands, 15% of every engineering sprint is dedicated to technical debt remediation:
1. **Zustand vs. TanStack Query Separation**: Refactor any lingering server-state queries out of Zustand into TanStack Query with structured stale times.
2. **Prisma Query Optimization**: Continuously audit slow database queries using `pg_stat_statements` and add composite indexes for multi-attribute PLP filters.
3. **Bundle Size Pruning**: Audit vendor dependencies quarterly to ensure top-level client bundles remain below the 140 KB gzipped budget.
4. **End-to-End Test Expansion**: Expand Playwright browser test coverage across Safari and Firefox viewports after every major checkout release.
