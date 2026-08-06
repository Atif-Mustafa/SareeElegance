# Enterprise Audit Logging & Immutability

---

## 1. Executive Summary
To ensure non-repudiation, compliance, and rapid forensic investigation, all critical mutations in the system—specifically those involving administrative actions, security configuration, catalog changes, and financial data—are recorded in a tamper-resistant PostgreSQL `SecurityAuditLog` table.

---

## 2. Audit Event Schema

Every audit record captures a comprehensive snapshot of the context and state transition:

- **actorId**: The UUID of the User/Admin performing the action.
- **actorRole**: The RBAC role at the time of the action (e.g., `MERCHANDISER`).
- **action**: The specific operation executed (e.g., `UPDATE_PRODUCT_PRICE`).
- **resourceType**: The entity being mutated (e.g., `Product`, `ExchangeRate`).
- **resourceId**: The UUID of the target resource.
- **timestamp**: UTC ISO 8601 timestamp.
- **traceId**: The distributed tracing UUID (`X-Trace-Id`) linking the action to Pino logs.
- **ipAddress**: The masked IP address of the client (e.g., `192.168.*.*` to respect PII minimization, or full IP for strictly internal admins).
- **userAgent**: The browser or API client string.
- **previousValue**: A JSON snapshot of the state *before* the mutation.
- **newValue**: A JSON snapshot of the state *after* the mutation.
- **reason / outcome**: Optional notes or `SUCCESS`/`FAILURE` status.

---

## 3. Scope of Audited Actions

The following high-sensitivity workflows mandate an audit trail:

### 3.1 Security & Access
- `USER_LOGIN_SUCCESS`, `USER_LOGIN_FAILED`
- `ROLE_ASSIGNED`, `ROLE_REVOKED`
- `ADMIN_IMPERSONATION_STARTED`
- `PASSWORD_RESET_REQUESTED`

### 3.2 Catalog & Inventory (Merchandising)
- `PRODUCT_CREATED`, `PRODUCT_PUBLISHED`, `PRODUCT_PRICE_UPDATED`
- `INVENTORY_MANUAL_ADJUSTMENT`
- `EXCHANGE_RATE_MANUAL_OVERRIDE`

### 3.3 Orders & Financials (OMS)
- `ORDER_CANCELLED`
- `REFUND_APPROVED`
- `COUPON_CREATED`

### 3.4 Privacy & Compliance
- `CUSTOMER_DATA_EXPORTED`
- `CUSTOMER_DATA_ANONYMIZED` (Right to Erasure)

---

## 4. Tamper Resistance & Retention

- **Database Immutability**: The `SecurityAuditLog` table strictly denies SQL `UPDATE` and `DELETE` commands via PostgreSQL Row-Level Security (RLS) triggers. Records are append-only.
- **Data Retention**: Audit logs are retained for **7 years** to comply with Indian GST, DPDP Act, and international financial statutory requirements.
- **PII Minimization**: Passwords, raw credit card tokens, and specific customer street addresses are redacted or hashed before being serialized into the `previousValue` / `newValue` JSON blobs.

---

## 5. Alerting for Suspicious Actions
Integrations with Prometheus and Sentry automatically flag high-risk anomalies:
- 5+ `USER_LOGIN_FAILED` attempts within a 10-minute window for Super Admin accounts.
- Any manual `EXCHANGE_RATE_MANUAL_OVERRIDE` deviating more than 10% from the OpenExchangeRates baseline.
- `ROLE_ASSIGNED` granting `SUPER_ADMIN` privileges.
