# Enterprise Observability, Distributed Tracing & Telemetry Architecture

---

## 1. Executive Summary & Three Pillars of Observability
Our enterprise observability architecture proposes integrating **Structured Logging (Pino)**, **Distributed Tracing (OpenTelemetry)**, and **Time-Series Metrics (Prometheus / Grafana)** to provide full-stack visibility.

**Status**: Proposed — The current repository does not yet implement these telemetry platforms or instrumentation. The architecture below defines the target state.

---

## 2. Distributed Tracing & Correlation IDs

### 2.1 W3C Tracing Standards
We adhere to W3C standards for distributed tracing. Do not use custom headers like `X-Trace-Id` for tracing.
- **`traceparent`** & **`tracestate`**: Standard W3C headers for OpenTelemetry context propagation.
- **`X-Request-ID`**: Uniquely identifies a single HTTP request (generated via Express middleware or platform, do not assume Nginx generation without modules).
- **`X-Correlation-ID`**: Groups a logical sequence of requests (e.g., checkout flow).

### 2.2 Propagation & Trust Boundaries
- **Generation Rules**: Traces originate at the frontend or API gateway.
- **Propagation**: Headers are propagated through Express middleware, BullMQ asynchronous background jobs, and external API calls.
- **Database Tracing**: Prefer Prisma instrumentation and OpenTelemetry spans over injecting SQL comments.

---

## 3. Structured JSON Logging Specification (Pino)

All backend logs must be emitted in JSON format via `pino` with standard structured attributes.

**Required Fields**: `timestamp`, `level`, `service`, `environment`, `requestId`, `correlationId`, `traceId`, `spanId`, `route`, `method`, `statusCode`, `durationMs`, `errorCode`, `actorType`. Include `actorId` only when justified.

**Redaction & Privacy**:
- **DO NOT LOG**: Passwords, Tokens, Cookie values, Full addresses, Payment data, Sensitive personal data, Raw request bodies (by default).
- Avoid logging product names, customer names, and financial values unless operationally necessary.

```json
{
  "level": "info",
  "time": "2026-08-03T03:55:12.045Z",
  "service": "checkout-api",
  "environment": "production",
  "requestId": "req-1234",
  "traceId": "00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01",
  "spanId": "b7ad6b7169203331",
  "route": "/api/v1/checkout",
  "method": "POST",
  "statusCode": 200,
  "durationMs": 142,
  "message": "Checkout completed successfully"
}
```

---

## 4. Key Operational Metrics & Prometheus Alerting Rules

### 4.1 Metrics Separation
Business analytics (e.g., Funnel conversion, AOV, GMV, AI-assisted purchase conversion) must be separated from operational metrics. See `/docs/ANALYTICS.md` for business metrics.

**Operational Metrics**:
- HTTP latency, Error rate
- Database latency, Redis latency, Redis hit ratio
- Queue lag, Queue failures
- External provider latency, Payment webhook backlog

### 4.2 Critical PagerDuty Alerting Thresholds
**Status**: Initial hypothesis — requires production calibration.

| Alert Name | Alert Condition | Severity | On-Call Response Action |
| :--- | :--- | :--- | :--- |
| **HighAPILatency** | `p95(http_request_duration_seconds) > 250ms` for 3 mins | Warning | Inspect database connection pool and slow query logs. |
| **PaymentWebhookBacklog** | Payment webhook queue lag > 100 messages | Critical | Verify webhook worker health and external provider status. |
| **RedisMemoryExhaustion**| `redis_memory_used_ratio > 85%` | Warning | See Safe Redis Runbook. |
| **InventoryIntegrityError**| Confirmed sales exceed available inventory | Critical | Audit database serializable isolation logs and halt affected SKU sales. |

### 4.3 Safe Redis Runbook
Do not recommend arbitrary cache pruning.
1. Inspect memory usage and identify high-cardinality keys.
2. Check TTL coverage and queue usage.
3. Check eviction policy and verify persistence configuration.
4. Scale memory if necessary.
5. Delete keys only after impact analysis.

---

## 5. Frontend Error Tracking (Sentry)

- **Consent & Privacy**: Document consent requirements. Enable PII masking, URL/query-string scrubbing, and checkout-field masking.
- **Session Replay**: **Proposed — requires privacy and legal review**. If enabled, enforce strict sampling and environment separation.

---

## 6. OpenTelemetry Phased Adoption

**Status**: Proposed.

- **Phase 1**: Request IDs, Structured Pino logs, Basic health metrics, Sentry error tracking.
- **Phase 2**: OpenTelemetry HTTP tracing, Prisma tracing, Redis tracing, BullMQ propagation.
- **Phase 3**: Full external-provider tracing, Tail sampling, Service maps, Error budgets.

---

## 7. SLOs and Error Budgets

**Status**: Proposed — requires business approval and production measurement.

- **Storefront Availability**: 99.9%
- **API Availability**: 99.9%
- **Checkout Availability**: 99.99%
- **Payment Webhook Processing**: 99.95% (processed within 5s)
- **Inventory Reservation**: 99.99%
- **Notification Queue**: 99.9% (delivered within SLA)

---

## 8. Cardinality and Cost Control
- **Label Restrictions**: No user IDs or order IDs in metric labels.
- **Sampling**: Enforce trace sampling and log sampling. Establish retention tiers.

---

## 9. Dashboards
Define the following dashboard groups (specifying Audience, Metrics, Alerts, Refresh interval, Owner for each):
- Storefront health
- API health
- Database and Redis
- BullMQ
- Checkout and payments
- Inventory integrity
- Notifications
- Search
- AI Concierge
- Frontend Core Web Vitals
