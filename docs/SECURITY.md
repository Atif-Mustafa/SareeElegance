# Enterprise Security, Authentication & Compliance Architecture — Luxury Saree Platform

---

## 1. Security Philosophy & Principles
Our luxury e-commerce platform enforces a **Zero Trust Security Architecture** designed to safeguard high-value customer transactions, protect proprietary textile weaving designs, and ensure total compliance with international data privacy laws (GDPR, India DPDP Act, PCI-DSS SAQ-A).

### 1.1 Core Tenets
- **Never Trust, Always Verify**: Every HTTP request, regardless of whether it originates from a customer browser, internal admin dashboard, or partner API, must be authenticated, authorized, and cryptographically validated.
- **Defense in Depth**: Implement independent security barriers across Cloudflare WAF, Nginx Ingress, Express.js middleware, Service Layer RBAC/ABAC guards, and PostgreSQL Row/Column permissions.
- **Principle of Least Privilege**: Access to customer PII, order shipping ledgers, and Silk Mark inventory data is restricted strictly to authorized roles with continuous audit logging.

---

## 2. Stateless Authentication & Authorization Architecture

```
+------------------+         +-------------------+         +--------------------+
|  React 19 Client | --(1)-->|  Express API Gtwy | --(2)-->|    Redis Cache     |
|  (Memory Store)  |         |  (Verify JWT/Zod) |         | (Token Revocation /|
+------------------+         +-------------------+         | Rate Limit State)  |
         ^                             |                   +--------------------+
         | (3) Return Access Token     |                             |
         |     & HttpOnly Refresh      | (4) Validated & RBAC        |
         v                             v                             v
+-------------------------------------------------------------------------------+
|                    PostgreSQL Database (Prisma ORM)                           |
|             (Users • Roles • Permissions • Security Audit Log)                |
+-------------------------------------------------------------------------------+
```

### 2.1 JWT Access Tokens & Cookie-Based Refresh Tokens
- **Access Tokens (JWT)**:
  - Short-lived tokens (`15 minutes` TTL) signed with **RS256** asymmetric keys or high-entropy HMAC-SHA256 (`JWT_SECRET`).
  - Stored strictly in **client JavaScript memory** (Zustand state) — **never stored in LocalStorage or SessionStorage** to eliminate XSS token exfiltration risks.
  - Contains minimal claims: `sub` (UUID), `role`, `emailVerified`, and timestamps (`iat`/`exp`).
- **Refresh Tokens**:
  - Long-lived tokens (`7 days` TTL) issued strictly as `HttpOnly`, `Secure`, `SameSite=Strict` browser cookies.
  - Cryptographically hashed (`SHA-256`) before persistence in the PostgreSQL `RefreshToken` table.
  - **Automatic Token Rotation & Reuse Detection**: Upon refreshing, a new refresh token is issued and the old token is invalidated. If an invalidated refresh token is ever presented, the system triggers an automatic security alert and revokes **all** active tokens for that user ID.

### 2.2 Role-Based & Attribute-Based Access Control (RBAC & ABAC)
- **Roles**: `CUSTOMER`, `SUPPORT_AGENT`, `MERCHANDISER`, `INVENTORY_MANAGER`, `SUPER_ADMIN`.
- **RBAC Middleware**:
  ```ts
  app.get('/api/v1/admin/orders', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'MERCHANDISER'), getOrdersController);
  ```
- **ABAC Ownership Guard**: Customer-facing endpoints (`GET /api/v1/orders/:id`) enforce attribute checks ensuring `req.user.id === order.userId` unless the caller possesses an administrative role.
- **Password Policy**: Minimum 12 characters requiring uppercase, lowercase, numeric, and symbol characters, validated against the HaveIBeenPwned breached password database via k-Anonymity SHA-1 prefix matching.

---

## 3. Network Security, Middleware & HTTP Hardening

### 3.1 Helmet.js & Content Security Policy (CSP)
Every HTTP response headers are hardened via **Helmet.js** with strict CSP directives:
```http
Content-Security-Policy: default-src 'self'; img-src 'self' data: https://cdn.my-saree-store.com; script-src 'self' https://js.stripe.com; style-src 'self' 'unsafe-inline'; frame-src 'self' https://js.stripe.com;
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### 3.2 Rate Limiting & DDoS Protection
- **Edge Layer**: Cloudflare WAF mitigates volumetric DDoS attacks and blocks bot scrapers attempting to harvest saree catalog photography.
- **Redis Rate Limiting Middleware (`express-rate-limit` + `rate-limit-redis`)**:
  - Public Browsing APIs (`GET /api/v1/products`): `120 requests / 15 minutes` per IP.
  - Authentication APIs (`POST /api/v1/auth/login`): `5 requests / 15 minutes` per IP/account to prevent brute-force and credential stuffing attacks.
  - AI Concierge APIs (`POST /api/v1/ai/concierge`): `15 requests / minute` per authenticated user to prevent LLM token exhaustion.

### 3.3 CSRF & CORS Governance
- **CORS**: Strictly restricted to explicit production origin domains (`https://my-saree-store.com`, `https://admin.my-saree-store.com`). Wildcards (`*`) are prohibited.
- **CSRF**: Mitigated by `SameSite=Strict` cookies and mandatory `X-Requested-With` custom headers on state-changing API mutations (`POST`, `PUT`, `DELETE`).

---

## 4. Threat Prevention & OWASP Top 10 Hardening

### 4.1 SQL Injection (SQLi) & NoSQL Injection
- All database operations are executed via **Prisma ORM** parameterized queries.
- Raw SQL execution is forbidden unless explicitly reviewed and wrapped using `Prisma.sql` template tags.

### 4.2 Cross-Site Scripting (XSS)
- React 19 native JSX escaping prevents DOM-based XSS.
- `dangerouslySetInnerHTML` is prohibited unless content is sanitized via `DOMPurify` with strict tag whitelisting (used only for rich heritage storytelling markdown).

### 4.3 Input Validation (Zod Schema Guard)
- Every incoming HTTP payload, query parameter, and URL parameter must be parsed through a **Zod** schema prior to reaching the Service Layer.

---

## 5. Secrets Management, Audit Logging & CI/CD DevSecOps

### 5.1 Secrets Management
- Application secrets (`DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `GEMINI_API_KEY`) are injected via Google Secret Manager / AWS Secrets Manager at runtime.
- Never hardcoded in source control or committed to `.env` files.

### 5.2 Immutable Security Audit Log (`SecurityAuditLog`)
- Every sensitive mutation (admin login, role promotion, manual price override, discount coupon creation, order refund) writes an immutable record to PostgreSQL:
  ```prisma
  model SecurityAuditLog {
    id          String   @id @default(uuid())
    actorId     String   // Admin User UUID
    action      String   // e.g., "PRICE_OVERRIDE", "REFUND_INITIATED"
    resourceId  String   // Target Saree UUID or Order UUID
    ipAddress   String
    payloadDiff Json     // JSON diff of changes
    createdAt   DateTime @default(now())
  }
  ```

### 5.3 OpenTelemetry & Distributed Observability
- OpenTelemetry SDK integrates with Pino logging and Grafana/Sentry to trace distributed requests across API gateways, Redis caches, and database pools.

### 5.4 CI/CD Pipeline Scanning & CodeQL
- **GitHub Secret Scanning**: Automatically blocks commits containing accidentally pasted API keys or private certificates.
- **CodeQL & Dependency Scanning**: Automated static application security testing (SAST) and npm audit vulnerability scanning run on every GitHub Pull Request.

---

## 6. Enterprise Privacy, Regulatory Compliance & Data Sovereignty Governance

To operate legally across India, the European Union, United States, and the Middle East, our architecture embeds automated privacy compliance into every data workflow:

```
+---------------------------------------------------------------------------------+
|                       ENTERPRISE REGULATORY COMPLIANCE MATRIX                   |
|                                                                                 |
|  [India DPDP Act 2023]  -> Consent Manager • Grievance Officer SLA (< 7 days)   |
|  [GDPR (EU) / UK DPA]   -> Right to be Forgotten • Data Portability • Cookie AA |
|  [CCPA / CPRA (Calif.)] -> "Do Not Sell My Info" Opt-Out • Privacy Disclosure   |
|  [PCI-DSS SAQ-A]        -> Zero Card Data Touch • Stripe/Razorpay Tokenization  |
+---------------------------------------------------------------------------------+
```

### 6.1 Automated PII Anonymization & "Right to be Forgotten" (`DELETE /api/v1/user/account`)
- When a customer exercises their right to erasure under GDPR Article 17 or India DPDP Act Section 12, an automated saga workflow executes:
  1. All active JWT refresh tokens and browser sessions are revoked in Redis.
  2. Personally Identifiable Information (PII) in the `User` and `Address` tables (`name`, `email`, `phone`, `streetAddress`) is overwritten with cryptographic hashes (`ANONYMIZED_USER_8a9d1b`).
  3. Order accounting ledgers are retained for 7 years as mandated by Indian GST and statutory tax laws, but are unlinked from customer identity.

### 6.2 PCI-DSS SAQ-A Zero Card Data Touch
- Our Express backend servers and PostgreSQL database **never ingest, process, or store raw credit card numbers, CVVs, or bank routing credentials**.
- All card inputs are hosted inside isolated iframe elements managed by Stripe (`Stripe Elements`) or Razorpay (`Razorpay Checkout`). Backend servers only handle tokenized payment intents (`pi_3M...`) and webhook signature validation (`Stripe-Signature` HMAC-SHA256).

### 6.3 Cookie Consent Governance
- Storefront visitors are presented with an accessible, granular Cookie Preference Banner.
- Non-essential analytics and marketing cookies (e.g., GA4, Meta Pixel) remain disabled by default (`defaultConsent: 'denied'`) until explicit user consent is recorded in `localStorage` and synchronized with Google Consent Mode v2.
