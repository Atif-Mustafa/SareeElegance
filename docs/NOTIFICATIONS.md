# Enterprise Omnichannel Notification Architecture — Luxury Saree Platform

---

## 1. Executive Summary & Omnichannel Strategy
To provide a white-glove customer experience throughout the saree acquisition journey, the platform implements a decoupled, event-driven **Omnichannel Notification Architecture**. 

**Status**: Proposed — Requires business and procurement decisions for vendor selection. The current repository does not yet implement these queues or integrations.

---

## 2. Notification Dispatch Pipeline & Architecture

### 2.1 Provider-Neutral Adapters
The system must be built using adapter interfaces, so we do not commit prematurely to a specific vendor. Candidates listed below require procurement decisions.
- `EmailProvider` (Candidates: SendGrid, AWS SES)
- `SmsProvider` (Candidates: MSG91, Twilio)
- `WhatsAppProvider` (Candidates: Interakt, Twilio)
- `InAppNotificationProvider`

### 2.2 In-App Delivery
**Status**: Deferred (WebSockets).
Instead of defaulting to Socket.io, we will compare approaches:
- **Polling**: Simple to implement, good for low-frequency updates, but high latency.
- **Server-Sent Events (SSE)**: Unidirectional real-time updates (server to client). Best for order status and toast notifications without the overhead of WebSockets.
- **WebSockets**: Bidirectional real-time. This is **deferred** unless a specific bidirectional feature (like live chat) requires it. We recommend starting with HTTP Polling or SSE for the current project stage.

---

## 3. Notification Types

### 3.1 Transactional
These are critical to the user journey and operate under different consent rules:
- OTP and Password reset
- Order confirmation, Payment confirmation, Payment failure
- Shipment update, Delivery confirmation
- Return and Refund updates
- Inventory reservation expiry

### 3.2 Marketing
These require explicit opt-in and consent management:
- Abandoned cart
- Wishlist reminder
- Back-in-stock
- Price drop
- Festival campaigns and Collection launches
- Concierge follow-up

---

## 4. Consent and Preferences

**Status**: Proposed — Requires legal review.

- **Per-channel opt-in**: Users can opt in/out per channel (Email, SMS, WhatsApp).
- **Marketing Consent**: Required for all marketing messages. Transactional messages have exceptions.
- **Tracking**: We must track Consent Timestamp, Source, and Version.
- **Withdrawal**: Users must easily be able to withdraw consent.
- **Rules**: Enforce Quiet Hours, respect Customer Timezone, maintain Suppression lists and Do-not-contact rules, complying with Regional legal requirements.

---

## 5. Idempotency & Delivery Lifecycle

### 5.1 Durable Idempotency
Do not rely solely on Redis. Define a durable notification dispatch record in PostgreSQL:
```ts
interface NotificationRecord {
  notificationId: string;
  eventId: string;
  userId: string;
  templateId: string;
  templateVersion: string;
  channel: string;
  provider: string;
  idempotencyKey: string;
  status: NotificationStatus;
  attemptCount: number;
  providerMessageId?: string;
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
}
```
Duplicate protection must handle delayed webhook replay beyond 24 hours.

### 5.2 Delivery Lifecycle Statuses
- `PENDING`, `QUEUED`, `SENT`, `DELIVERED`, `FAILED`, `BOUNCED`, `REJECTED`, `SUPPRESSED`, `CANCELLED`

**Policies**:
- Implement exponential backoff for retry policy.
- Handle maximum attempts and send to a dead-letter queue.
- Handle provider delivery receipts, bounce handling, complaint handling, and WhatsApp template rejection (distinguishing permanent vs transient failure).

---

## 6. Fallback Rules
Avoid automatically sending duplicate messages across every channel. Controlled fallback logic:
1. Try primary channel.
2. Wait for failure or timeout.
3. Evaluate fallback eligibility.
4. Respect user preferences and consent.
5. Send only if necessary.
6. Record the fallback reason.

---

## 7. Template Governance
- **WhatsApp Templates**: Must handle approval states.
- **Versioning**: Track Template IDs, versions, required variables, validation, and approval status.
- **Testing**: Enable preview, test sending, email rendering tests, and rollback capabilities. Archive old versions.

---

## 8. Security and Privacy
- **Data Minimization**: No sensitive payment data in messages. Minimize PII in payloads.
- **Secure Links**: Use secure tracking links, signed URLs, and link expiration.
- **Protection**: Implement template injection protection and audit logging.
- Ensure provider data-processing agreements are in place.

---

## 9. Metrics

**Status**: Proposed — Requires production measurement.

Define the following metrics for the observability platform:
- Queue latency, Send latency, Delivery success
- Bounce rate, Complaint rate, Retry rate
- Dead-letter count, Provider failure rate
- Unsubscribe rate, Template failure rate
