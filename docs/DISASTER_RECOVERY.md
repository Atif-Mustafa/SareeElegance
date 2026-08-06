# Enterprise Disaster Recovery & Incident Response

---

## 1. Executive Summary

This document defines the RPO (Recovery Point Objective), RTO (Recovery Time Objective), and incident response runbooks for the Saree Elegance platform.

**Current Architecture Reality**: We currently operate a single-region deployment. Multi-region active-active deployment is an *optional future innovation* and is not currently implemented.

---

## 2. Service Criticality & Recovery Objectives

| Service | RPO (Data Loss Tolerance) | RTO (Downtime Tolerance) | Backup Strategy |
| :--- | :--- | :--- | :--- |
| **PostgreSQL (Primary DB)** | 5 Minutes (Point-in-Time) | 1 Hour | Continuous WAL Archiving + Daily Snapshots |
| **Redis (Cache & Queues)** | N/A (Ephemeral) | 15 Minutes | Infrastructure-as-Code Redeployment |
| **Object Storage (Media)**| 24 Hours | 4 Hours | Cross-Region Replication (Future) / Versioning |
| **Express.js API Node** | 0 Minutes | 5 Minutes | Auto-Scaling Group / Kubernetes ReplicaSet |

---

## 3. Incident Severity Levels

- **SEV-1 (Critical)**: Total storefront outage, checkout completely broken, massive data corruption, or active security breach. (Requires immediate PagerDuty page to all on-call engineers).
- **SEV-2 (High)**: Core feature degraded (e.g., search down, specific payment gateway failing, inventory sync delayed).
- **SEV-3 (Medium)**: Non-critical feature broken (e.g., AI Concierge offline, internal admin reporting delayed).

---

## 4. Standard Incident Runbooks

### 4.1 Payment Provider Outage (SEV-2)
*Symptom*: Stripe or Razorpay APIs return 5xx errors; checkout conversions drop.
*Action*:
1. Toggle the `payment_gateway_failover` feature flag via Admin portal or CLI to route traffic to the secondary provider.
2. Monitor `checkout_funnel_conversion_rate` in Grafana.

### 4.2 Oversold Unique Saree (SEV-2)
*Symptom*: Two customers successfully paid for the same 1-of-1 SKU due to a race condition or webhook delay.
*Action*:
1. Identify the earliest `PaymentSucceeded` webhook timestamp in the `SecurityAuditLog`.
2. The second buyer's order is manually transitioned to `CANCELLED_OVERSOLD`.
3. Customer Service immediately contacts the second buyer with a full refund and a high-value apology coupon.

### 4.3 Redis Outage / Cache Stampede (SEV-1 / SEV-2)
*Symptom*: Redis crashes; API latencies spike > 2000ms as traffic hits PostgreSQL directly.
*Action*:
1. Restart Redis cluster.
2. Enable `maintenance_mode` feature flag to display a friendly static page for 2 minutes while caches aggressively re-warm.
3. Disable maintenance mode once PostgreSQL CPU drops below 60%.

### 4.4 Suspected Data Breach (SEV-1)
*Symptom*: Unknown IP exporting bulk customer data.
*Action*:
1. Revoke the compromised Admin's JWT token and disable their account.
2. Rotate PostgreSQL database passwords.
3. Initiate the Privacy Compliance Breach Workflow (notify users within 72 hours).

---

## 5. Deployment Rollback Strategy
If a new release causes a spike in `500 Internal Server Errors`:
1. Execute `git revert` or use the CI/CD pipeline UI to instantly deploy the previous stable Docker image tag.
2. If database migrations were run, execute down migrations *only* if backward compatibility is fundamentally broken (down migrations are highly risky; prefer rolling forward with a fix).
