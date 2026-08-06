# Enterprise Quality Assurance, Testing Pyramid & Verification Architecture — Luxury Saree Platform

---

## 1. Executive Summary & QA Philosophy
To ensure enterprise reliability across our luxury saree platform—where a single checkout may involve high-value transactions exceeding ₹2,00,000 / $2,500 USD—we enforce a comprehensive **Testing Pyramid**. Every pull request must pass automated unit tests, integration API tests, accessibility audits, visual regression checks, and end-to-end (E2E) browser flows before merging.

```
                  / \
                 /   \
                / E2E \       <-- Playwright (Cross-Browser Buyer & Admin Journeys)
               /-------\
              / Integr. \     <-- Supertest + Vitest (Express REST APIs & DB Transactions)
             /-----------\
            /  Unit & UI  \   <-- Vitest + React Testing Library + axe-core A11y
           /---------------\
```

---

## 2. Automated Testing Frameworks & Tooling

### 2.1 Unit & Component UI Testing (Vitest + React Testing Library)
- **Scope**: Validates stateless UI primitives, saree price formatting utilities, localization currency converters, and custom React hooks (`useCurrency`, `useCart`).
- **Standard Pattern**:
  ```tsx
  import { render, screen } from '@testing-library/react';
  import { describe, it, expect } from 'vitest';
  import { SareePriceBadge } from './SareePriceBadge';

  describe('SareePriceBadge Component', () => {
    it('correctly converts INR to USD when US locale is active', () => {
      render(<SareePriceBadge priceINR={24500} targetCurrency="USD" exchangeRate={0.012} />);
      expect(screen.getByText(/\$294\.00/i)).toBeInTheDocument();
    });
  });
  ```

### 2.2 Backend API & Database Integration Testing (Vitest + Supertest)
- **Scope**: Verifies Express.js route controllers, Zod payload validation, RBAC/ABAC authorization rules, and Prisma database transactions against an isolated PostgreSQL test schema.
- **Key Test Scenarios**:
  - Verifying 1-of-1 unique saree checkout concurrency (ensuring two simultaneous checkout requests cannot purchase the same one-of-a-kind saree).
  - Verifying automatic GST calculation (12% vs 5% silk thresholds) and international DDP shipping fee rules.

### 2.3 End-to-End (E2E) Browser & Buyer Journey Testing (Playwright)
- **Scope**: Automates multi-page user journeys across Chromium, WebKit (Safari), and Firefox on both desktop and mobile viewports.
- **Core Playwright Test Suites**:
  1. `buyer-checkout-inr.spec.ts`: Completes a full checkout flow for a Banarasi Katan saree in INR using Stripe/Razorpay test tokens.
  2. `nri-diaspora-checkout-usd.spec.ts`: Switches country to United States, verifies dynamic USD currency conversion, adds custom blouse stitching, and completes DDP international checkout.
  3. `admin-merchandiser-flow.spec.ts`: Logs into `/admin`, creates a new seasonal festive banner, and verifies immediate Redis cache invalidation.

---

## 3. Specialized Enterprise Testing Capabilities

### 3.1 Accessibility Testing (axe-core + Playwright)
- Every storefront page is audited automatically during Playwright E2E runs using `@axe-core/playwright`.
- **Zero Tolerance Mandate**: Zero critical or serious accessibility violations allowed (WCAG 2.1 AA compliance for color contrast, ARIA landmarks, and keyboard focus trapping in modal drawers).

### 3.2 Visual Regression Testing (Playwright Snapshots)
- Captures pixel-level baseline screenshots of saree product cards, responsive headers, and promotional ribbons.
- Automatically flags visual layout regressions (`expect(page).toHaveScreenshot()`) if CSS changes alter saree thumbnail aspect ratios or typography tracking.

### 3.3 Performance, Load & Spike Testing (k6)
- Simulates high-concurrency festive flash sales using **k6** scripts targeting our Express API gateway:
  ```js
  import http from 'k6/http';
  import { check, sleep } from 'k6';

  export const options = {
    vus: 200, // 200 concurrent shoppers
    duration: '2m',
    thresholds: {
      http_req_duration: ['p(95)<150'], // 95% of requests must complete under 150ms
    },
  };

  export default function () {
    const res = http.get('https://api.my-saree-store.com/api/v1/products?category=banarasi-silk');
    check(res, { 'status is 200': (r) => r.status === 200 });
    sleep(1);
  }
  ```

### 3.4 Mutation & Security Testing
- **Mutation Testing (Stryker)**: Periodically mutates backend tax and price calculation operators (`+` to `-`, `>` to `>=`) to ensure existing unit tests trap arithmetic regressions.
- **Security Penetration Testing**: Automated CI workflows execute OWASP ZAP scans against staging APIs to detect SQL injection, XSS, and unauthenticated endpoint leakage.

---

## 4. Code Coverage & Quality Targets
- **Minimum Line Coverage**: `85%` across all `/src/server/services/` business logic and `/src/lib/` utilities.
- **Branch Coverage**: `80%` minimum on checkout tax, currency conversion, and RBAC authorization branches.
