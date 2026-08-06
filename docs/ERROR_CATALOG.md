# Enterprise Error Code Catalog & Taxonomy

---

## 1. Executive Summary

To simplify frontend error handling, localization mapping, and automated client retry logic, the platform utilizes a stable, standardized error code taxonomy. All REST API errors return an RFC 7807 `application/problem+json` payload containing these deterministic codes.

**Security Rule**: We do not expose sensitive implementation details (like SQL syntax errors, database connection strings, or internal stack traces) to the client. Unknown errors map generically to `INFRA_001` (Internal Server Error).

---

## 2. Namespace Taxonomy

Errors are categorized by Domain Bounded Context:
- `AUTH`: Identity, Authentication, JWT.
- `USER`: Customer Profiles, Addresses.
- `CATALOG`: Products, Categories, Attributes.
- `INVENTORY`: Stock levels, Reservations.
- `CART`: Cart state, validation.
- `CHECKOUT`: Checkout workflows.
- `ORDER`: OMS, Order processing.
- `PAYMENT`: Stripe/Razorpay gateways.
- `LOCALIZATION`: Currency, Languages.
- `ADMIN`: Merchandising, RBAC.
- `VALIDATION`: Zod Schema validations.
- `INFRA`: System, Redis, Database availability.

---

## 3. Error Code Reference Catalog

### 3.1 VALIDATION & AUTHENTICATION
| Code | HTTP | Description (Internal Diagnostic) | Safe User Message (Fallback) | Retryable |
| :--- | :---: | :--- | :--- | :---: |
| `VALIDATION_001` | `400` | Input payload failed Zod schema validation. | "Please check the highlighted fields for errors." | ❌ |
| `AUTH_001` | `401` | JWT access token missing, invalid, or expired. | "Your session has expired. Please log in again." | ❌ |
| `AUTH_002` | `403` | Refresh token invalid or rotation breach detected. | "Security constraint: Please log in again." | ❌ |
| `ADMIN_001` | `403` | Actor lacks required RBAC permission for action. | "You do not have permission to perform this action."| ❌ |

### 3.2 INVENTORY & CHECKOUT
| Code | HTTP | Description (Internal Diagnostic) | Safe User Message (Fallback) | Retryable |
| :--- | :---: | :--- | :--- | :---: |
| `INVENTORY_001`| `409` | 1-of-1 saree reserved by another shopper. | "This unique saree was just reserved by someone else." | ❌ |
| `CHECKOUT_001` | `409` | 15-minute cart hold expired before payment. | "Your reservation timer expired. Please try checking out again." | ✅ (Restart) |

### 3.3 PAYMENT & OMS
| Code | HTTP | Description (Internal Diagnostic) | Safe User Message (Fallback) | Retryable |
| :--- | :---: | :--- | :--- | :---: |
| `PAYMENT_001` | `402` | Payment gateway declined the transaction (insufficient funds). | "Your payment was declined. Please try a different card." | ✅ |
| `PAYMENT_002` | `400` | Stripe/Razorpay webhook signature HMAC verification failed. | "Payment verification failed. Contact support." | ❌ |

### 3.4 LOCALIZATION & CATALOG
| Code | HTTP | Description (Internal Diagnostic) | Safe User Message (Fallback) | Retryable |
| :--- | :---: | :--- | :--- | :---: |
| `CATALOG_001` | `404` | Saree SKU ID does not exist or was permanently archived. | "The requested saree could not be found." | ❌ |
| `LOCALIZATION_001`| `503` | OpenExchangeRates sync failed; rates are stale past TTL. | "Live currency conversion is temporarily unavailable." | ✅ (Auto) |

### 3.5 INFRASTRUCTURE
| Code | HTTP | Description (Internal Diagnostic) | Safe User Message (Fallback) | Retryable |
| :--- | :---: | :--- | :--- | :---: |
| `INFRA_001` | `500` | Unhandled runtime exception (fallback for all unknown crashes). | "An unexpected error occurred. Our team has been notified." | ✅ |
| `INFRA_002` | `429` | IP/Token Bucket rate limit exceeded on Nginx/Express layer. | "Too many requests. Please wait a moment." | ✅ (After Retry-Header) |

---

## 4. Client Behavior & Localization

- Frontend applications (React) use the `code` property (e.g., `INVENTORY_001`) as a lookup key for the `i18next` translation dictionary to present natively localized error messages (Hindi, Arabic, English).
- The `Safe User Message` is strictly a fallback if the i18next translation file fails to load.
