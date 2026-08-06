# Enterprise Privacy & Compliance Architecture

---

## 1. Executive Summary

This architecture embeds automated privacy compliance into every data workflow.

**Disclaimer**: This document is an engineering architecture guide, NOT legal advice. Policies regarding data retention lengths and specific consent language require qualified legal review.

---

## 2. Regulatory Frameworks

Our system is designed to adhere to:
- **India Digital Personal Data Protection (DPDP) Act 2023** (Primary Jurisdiction).
- **GDPR** (European Union) & **UK DPA** (for international shipping).
- **CCPA / CPRA** (California) (for international shipping).
- **PCI-DSS SAQ-A** (Payment Card Industry).

---

## 3. Consent Management

- **Cookie & Tracking Consent**: Storefront visitors are presented with a granular Cookie Preference Banner.
- **Default State**: Non-essential analytics and marketing cookies (e.g., GA4, Meta Pixel) remain disabled by default (`defaultConsent: 'denied'`).
- **Marketing Consent**: Explicit opt-in checkbox required during checkout and registration for promotional emails/WhatsApp. Pre-ticked boxes are strictly forbidden.
- **Consent Revocation**: Users can withdraw marketing consent via their Account Dashboard or via a standard 1-click unsubscribe link.

---

## 4. Right to Erasure & Data Anonymization

When a customer exercises their "Right to be Forgotten" (`DELETE /api/v1/user/account`), an automated saga workflow executes:

1. **Session Revocation**: All active JWT refresh tokens and browser sessions are revoked in Redis.
2. **PII Anonymization**: Personally Identifiable Information (PII) in the `User` and `Address` tables (`name`, `email`, `phone`, `streetAddress`) is overwritten with cryptographic hashes (`ANONYMIZED_USER_8a9d1b`).
3. **Ledger Retention**: Order accounting ledgers are retained for 7 years as mandated by Indian GST and statutory tax laws, but are permanently unlinked from customer identity.
4. **Third-Party Propagation**: Anonymization commands are dispatched to marketing tools (e.g., Mailchimp) via Webhook.

---

## 5. Right to Data Portability

Customers can request a copy of their data (`GET /api/v1/user/export`). 
- A background BullMQ job compiles their profile, order history, and saved addresses into a standard machine-readable JSON format.
- A secure expiring link is emailed to the customer.

---

## 6. PCI-DSS Zero Card Data Touch

- Our Express backend servers and PostgreSQL database **never ingest, process, or store raw credit card numbers, CVVs, or bank routing credentials**.
- All card inputs are hosted inside isolated iframe elements managed by Stripe (`Stripe Elements`) or Razorpay (`Razorpay Checkout`). 
- Backend servers only handle tokenized payment intents (`pi_3M...`) and webhook signature validation (`Stripe-Signature` HMAC-SHA256).

---

## 7. Data Breach & Incident Workflow

If unauthorized PII access is detected:
1. Revoke all active sessions and rotate database credentials.
2. The Security Officer is alerted via PagerDuty.
3. Affected users are notified within **72 hours** (per GDPR/DPDP requirements) via email, detailing the scope of the breach and mitigation steps.
