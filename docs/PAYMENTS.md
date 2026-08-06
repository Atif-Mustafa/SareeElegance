# Enterprise Payment & Checkout Architecture

---

## 1. Executive Summary

The platform processes high-value transactions globally. The payment architecture enforces **Backend Authority**—the frontend browser is never trusted to determine if an order is paid.

The system utilizes **Razorpay** (primarily for INR / Domestic) and **Stripe** (for USD/International DDP) as active providers, hidden behind a provider-neutral internal interface.

---

## 2. Order & Payment State Machine

### 2.1 Standard Checkout Lifecycle
1. **Cart Validation**: Backend verifies 1-of-1 saree inventory availability.
2. **Intent Creation**: Backend generates an `Order` (`status: PENDING`) and calls the provider to create a `PaymentIntent` / `OrderToken`.
3. **Reservation**: Backend places a 15-minute hold on the physical inventory.
4. **Client Authorization**: React frontend mounts the Stripe Elements or Razorpay UI securely. Customer inputs details.
5. **Webhook Confirmation**: The payment provider sends a secure server-to-server webhook (`payment.captured`).
6. **Backend Verification**: Backend validates the webhook signature, verifies the amount matches the order total exactly, and transitions the Order to `PAID`.

---

## 3. Webhook Idempotency & Security

- **Webhook Verification**: All webhooks validate the cryptographic HMAC signature (`Stripe-Signature` or `X-Razorpay-Signature`).
- **Idempotency**: Providers may send the same webhook twice. The backend processes the webhook using Redis idempotency keys (`idempotency:webhook:{eventId}`). Duplicate events return a `200 OK` without triggering duplicate ledger entries or duplicate dispatch emails.
- **Race Conditions**: If a user is redirected to the "Success" page before the webhook arrives, the frontend polls the backend `/api/v1/orders/:id/status` endpoint to confirm success, rather than blindly trusting the browser redirect.

---

## 4. Refund & Cancellation Lifecycle

- **Cancellation**: If payment fails or the 15-minute hold expires, the backend automatically transitions the order to `CANCELLED` and releases the inventory lock.
- **Refunds**: Admin merchandisers can initiate partial or full refunds via the `/admin` portal. The internal service translates this to a standard `RefundRequested` domain event, communicating securely with the respective provider's API.

---

## 5. Ledger Entries & Currency

- All financial transactions record a snapshot of the **Exchange Rate** at the exact moment of intent creation.
- The PostgreSQL `Payment` ledger records both the `settlementCurrency` (e.g., USD) and the `baseCurrencyAmount` (INR equivalent) to ensure accounting parity.
