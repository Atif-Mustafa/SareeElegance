# Enterprise Development Guidelines & Engineering Standards

This document establishes the mandatory engineering standards for contributing to the enterprise e-commerce codebase. All engineers must adhere to these guidelines during implementation and code reviews.

---

## 1. Core Architectural Principles

All code must conform to the following engineering principles:
- **SOLID**:
  - *Single Responsibility Principle (SRP)*: Components, services, and functions must have one reason to change.
  - *Open/Closed Principle (OCP)*: Software entities must be open for extension but closed for modification.
  - *Liskov Substitution Principle (LSP)*: Subtypes must be substitutable for their base types.
  - *Interface Segregation Principle (ISP)*: Prefer small, specific TypeScript interfaces over bloated general interfaces.
  - *Dependency Inversion Principle (DIP)*: High-level modules must depend on abstractions, not concrete implementations.
- **DRY (Don't Repeat Yourself)**: Extract shared logic into reusable utility functions, custom React hooks, or service modules.
- **KISS (Keep It Simple, Stupid)**: Avoid over-engineering. Write clear, explicit, and self-documenting code.
- **YAGNI (You Aren't Gonna Need It)**: Do not build speculative features or complex hierarchies until explicitly required.
- **Clean Architecture**: Strictly isolate domain business logic from UI components and external database/HTTP frameworks.

---

## 2. Reuse Before Create (Mandatory Rule)

Before creating any new component, hook, utility, or backend service:
1. **Search existing components** in `/src/components/ui/` and `/src/components/layout/`.
2. **Check existing hooks** in `/src/hooks/` and `/src/store/`.
3. **Check existing utilities and types** in `/src/lib/`, `/src/utils/`, and `/src/types.ts`.
4. If an existing module fulfills 80% of your requirement, **extend it** via optional props or composition rather than duplicating code.

---

## 3. Frontend Engineering Rules (React 19 + TypeScript)

### 3.1 Component Architecture
- Prefer **functional components** with explicit TypeScript return types or standard interface props.
- Keep components small (<150 lines where feasible). Extract complex sub-sections into dedicated sub-components.
- Keep UI components presentational. Business logic, API fetching, and complex transformations belong in custom hooks (`/src/hooks/`) or TanStack Query queries.

### 3.2 State Management
- **Global Application State (Zustand)**: Use strictly for UI state, drawer toggles, active modals, and client-only session preferences (e.g., selected currency code).
- **Server State (TanStack Query)**: Use for all asynchronous REST API fetching, caching, pagination, and invalidation. **Never duplicate server state inside Zustand.**

### 3.3 Styling & Typography
- Style components using **Tailwind CSS** utility classes.
- Do not create separate `.css` files or use inline `style={{ ... }}` attributes unless dynamic coordinate calculations are required.
- Maintain accessible color contrast ratios (WCAG AA minimum 4.5:1 for body text).

---

## 4. Backend Engineering Rules (Node.js LTS + Express.js)

### 4.1 Layer Responsibilities
- **Controllers**: Only handle HTTP request parsing, Zod schema validation, and HTTP response formatting. Never embed business logic or database queries inside controllers.
- **Services**: Contain all domain business logic, tax calculations, and external integrations.
- **Prisma Repositories**: Encapsulate PostgreSQL database queries, transactions, and indexing strategies.

### 4.2 Error Handling & Logging
- Use centralized middleware for exception handling.
- Never leak database stack traces or sensitive environment variables to HTTP clients.
- Use **Pino** for structured JSON logging across all backend services.

---

## 5. Accessibility (A11y) & Localization Standards
- All interactive DOM elements (`button`, `a`, `input`, `select`) must have accessible labels (`aria-label`, standard label tags).
- Ensure keyboard navigation support and focus outline visibility across all modals and dropdowns.
- Never hardcode user-facing copy. All UI strings must use translation keys via `useTranslation()` / `i18next`.
- Never hardcode currency symbols or number formatting. Always use `Intl.NumberFormat` with backend-provided currency codes.

---

## 6. Engineering Governance & Lifecycle

### 6.1 Folder Ownership & Module Boundaries
To maintain a scalable modular monolith:
- **Dependency Direction**: UI components depend on Hooks. Hooks depend on Services. Services depend on Repositories. Circular dependencies are strictly forbidden.
- **Module Isolation**: Files inside `src/modules/catalog/` must not directly import internals from `src/modules/orders/`. Inter-module communication should happen via defined public interfaces or domain events.

### 6.2 Naming Conventions
- **Files/Folders**: PascalCase for React components (`SareeCard.tsx`). kebab-case for utilities, hooks, and backend modules (`calculate-tax.ts`, `use-cart.ts`).
- **Types/Interfaces**: PascalCase without `I` prefixes (`ProductVariant`, not `IProductVariant`).
- **Environment Variables**: UPPER_SNAKE_CASE (e.g., `STRIPE_SECRET_KEY`).
- **Database Tables**: PascalCase (`User`, `OrderItem`) matching Prisma standards.
- **Events**: PascalCase past-tense (`OrderPlaced`, `InventoryReserved`).
- **Error Codes**: UPPER_SNAKE_CASE scoped by domain (`CHECKOUT_001`).

### 6.3 Git & Branching Strategy
- **Branch Naming**: `type/issue-number-short-description` (e.g., `feat/SAREE-102-add-zari-filter`, `fix/SAREE-405-cart-crash`).
- **Conventional Commits**: Commit messages must follow the `type(scope): description` format (e.g., `feat(catalog): add macro zoom viewer`, `fix(payment): resolve race condition in webhook`).

### 6.4 Code Review Checklist & Pull Requests
Every PR requires a standard template and sign-off on:
- [ ] No regression of existing features.
- [ ] Zod validation added for new API inputs.
- [ ] i18next used for all new user-facing strings.
- [ ] Tailwind colors use designated Heirloom Ivory design system tokens.
- [ ] Database migrations reviewed for locking/downtime risks.
- [ ] Unit tests (Vitest) added/updated for business logic.

### 6.5 Definition of Done (DoD)
A feature is only considered "Done" when:
1. Code is peer-reviewed and merged to `main`.
2. E2E critical paths pass in Playwright.
3. Feature flag (if applicable) is active in staging.
4. API documentation (`API_SPEC.md` or OpenAPI) is updated.
5. Observability (Pino logs, metrics) is wired for critical paths.

### 6.6 Deprecation & Dependency Policy
- **Dependencies**: New npm packages require architectural review. Do not add heavy libraries (e.g., Moment.js) when native alternatives exist.
- **Deprecation**: Deprecated APIs must issue sunset headers for 180 days before removal. Deprecated components must be marked with `@deprecated` in JSDoc.

---

## 7. Architecture Decision Records (ADRs)
All major technical decisions are documented in `/docs/adr/`. See `/docs/adr/README.md` for the template and decision log.
