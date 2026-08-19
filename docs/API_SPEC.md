# REST API Specification & OpenAPI Conventions

This document defines the REST API standards, endpoint structure, authentication protocol, and error handling for all backend Express.js microservices.


### Cart Validation Endpoint

**`POST /api/v1/cart/validate`**
Stateless validation of cart intents against authoritative catalog pricing. 
(Replaces reliance on frontend `priceINR` derivatives.)

#### Request
```json
{
  "lines": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ]
}
```

#### Response (Success)
```json
{
  "success": true,
  "data": {
    "valid": true,
    "lines": [
      {
        "productId": "uuid",
        "sku": "SR-001",
        "slug": "example-saree",
        "name": "Example Saree",
        "quantity": 2,
        "unitPrice": {
          "amountMinor": "250000",
          "currency": "INR"
        },
        "lineSubtotal": {
          "amountMinor": "500000",
          "currency": "INR"
        },
        "status": "VALID"
      }
    ],
    "totals": {
      "subtotal": {
        "amountMinor": "500000",
        "currency": "INR"
      }
    }
  },
  "meta": {
    "timestamp": "...",
    "requestId": "..."
  }
}
```

#### Response (Validation Failure - Mixed Currency)
```json
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "CART_CURRENCY_MISMATCH",
    "lines": [ ... ],
    "totals": {
      "subtotal": { "amountMinor": "0", "currency": "INR" }
    }
  }
}
```

#### Response (Infrastructure Failure - Database Unreachable)
```json
{
  "type": "about:blank",
  "title": "Service Unavailable",
  "status": 503,
  "code": "INFRA_001",
  "detail": "Unable to verify current cart total.",
  "instance": "/api/v1/cart/validate",
  "requestId": "req-12345"
}
```

---

## 1. Core API Principles
- **RESTful Naming**: Use plural nouns for resource endpoints (`/api/v1/products`, `/api/v1/languages`).
- **Versioning**: Explicit API versioning in URL paths (`/api/v1/...`).
- **Stateless Authentication**: Bearer token authentication via JSON Web Tokens (JWT) in the `Authorization: Bearer <token>` header.
- **Content-Type**: Always exchange data using `application/json; charset=utf-8`.

---

## 2. Standard HTTP Response Formats

### 2.1 Successful Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "c81d4e2e-bcf2-11ee-a506-0242ac120002",
    "name": "Banarasi Katan Silk Saree",
    "price": {
      "amountMinor": "1450000",
      "currency": "INR"
    },
    
  },
  "meta": {
    "timestamp": "2026-08-02T03:15:00.000Z"
  }
}
```

### 2.2 Paginated List Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "c81d4e2e-bcf2-11ee-a506-0242ac120002",
      "name": "Banarasi Katan Silk Saree"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 142,
    "totalPages": 8
  }
}
```

### 2.3 Standard Error Response (`400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Server Error`)
```json
{
  "type": "about:blank",
  "title": "Validation Error",
  "status": 400,
  "code": "VALIDATION_001",
  "detail": "Input payload failed Zod schema validation.",
  "instance": "/api/v1/localization/translations/invalid",
  "requestId": "req-12345"
}
```

---


## 3. Catalog Endpoints (Read-Only)

### 3.1 Get Active Products
- **Method / Path**: `GET /api/v1/products`
- **Description**: Returns a paginated list of active products in the catalog.
- **Parameters**: 
  - `page` (default 1)
  - `limit` (default 24)
  - `category`, `fabric`, `weave`, `region`, `color`, `occasion`, `minPriceMinor`, `maxPriceMinor`
  - `sort` (newest, price_asc, price_desc, name_asc)
- **Response**: Paginated list of `CatalogProductSummary` DTOs. BigInt prices are returned as strings.

### 3.2 Get Product Details
- **Method / Path**: `GET /api/v1/products/:slug`
- **Description**: Returns the full `CatalogProductDetail` DTO for a specific active product by its slug.
- **Response**: `CatalogProductDetail`. Returns 404 for DRAFT, ARCHIVED, or unknown products.

### 3.3 Get Active Categories
- **Method / Path**: `GET /api/v1/categories`
- **Description**: Returns all active categories.
- **Response**: List of `CatalogCategoryDto`.

## 4. Localization & Currency Endpoints

### 3.1 Get Localization Config
- **Method / Path**: `GET /api/v1/localization/config`
- **Description**: Returns all active countries, supported languages, default currencies, and RTL metadata.
- **Caching**: Redis Cache TTL = 3,600 seconds (`Cache-Control: public, max-age=3600`).
- **Response**:
```json
{
  "success": true,
  "data": {
    "countries": [
      { "isoCode": "IN", "name": "India", "defaultLocale": "hi-IN", "defaultCurrency": "INR" },
      { "isoCode": "US", "name": "United States", "defaultLocale": "en-US", "defaultCurrency": "USD" },
      { "isoCode": "AE", "name": "United Arab Emirates", "defaultLocale": "en-AE", "defaultCurrency": "AED" }
    ],
    "languages": [
      { "code": "en", "name": "English", "nativeName": "English", "direction": "ltr" },
      { "code": "hi", "name": "Hindi", "nativeName": "हिन्दी", "direction": "ltr" },
      { "code": "ur", "name": "Urdu", "nativeName": "اردو", "direction": "rtl" }
    ]
  }
}
```

### 3.2 Get Namespace Translation Dictionary
- **Method / Path**: `GET /api/v1/localization/translations/:locale/:namespace`
- **Description**: Serves dynamic JSON namespaces for `i18next-http-backend` (`common`, `product`, `checkout`).
- **Headers**: Includes HTTP `ETag` and conditional `304 Not Modified` support.
- **Response**:
```json
{
  "navbar.home": "Home",
  "navbar.heritage": "Heritage",
  "navbar.search_placeholder": "Search silk sarees...",
  "cart.total": "Total Amount"
}
```

### 3.3 Get Active Exchange Rates
- **Method / Path**: `GET /api/v1/currencies/rates`
- **Description**: Returns live exchange rates relative to the INR base currency.
- **Response**:
```json
{
  "success": true,
  "data": {
    "base": "INR",
    "rates": {
      "INR": 1.0,
      "USD": 0.012,
      "GBP": 0.0095,
      "EUR": 0.011,
      "AED": 0.044
    },
    "effectiveDate": "2026-08-02T00:00:00.000Z"
  }
}
```

---

## 4. HTTP Status Code Governance
- `200 OK`: Request succeeded.
- `201 Created`: New resource successfully created.
- `204 No Content`: Successful deletion or update with no return body.
- `400 Bad Request`: Zod validation error or malformed input payload.
- `401 Unauthorized`: Missing or expired JWT bearer token.
- `403 Forbidden`: Insufficient RBAC permissions.
- `404 Not Found`: Resource ID does not exist in PostgreSQL.
- `429 Too Many Requests`: Rate limiter threshold exceeded.
- `500 Internal Server Error`: Unhandled server exception.

---

## 5. Enterprise API Governance, Versioning & Lifecycle Management

To support mobile client apps, headless luxury partner storefronts, and third-party POS integrations without regression, all API endpoints adhere to strict lifecycle governance:

### 5.1 API Versioning & Breaking Change Policy
- **URL Path Versioning**: Major versions are immutable and explicitly included in the URL (`/api/v1/...`).
- **Semantic Contract Governance**:
  - **Non-Breaking Changes**: Adding optional query parameters, new JSON response fields, or new endpoints is permitted within `v1`.
  - **Breaking Changes**: Renaming/removing JSON fields, changing parameter types, or altering authentication rules requires bumping to `/api/v2/` and initiating a formal deprecation schedule.
- **OpenAPI 3.1 & Swagger Specification**: Every route controller must be annotated with OpenAPI 3.1 decorators. CI/CD pipelines validate that runtime Zod schemas match the OpenAPI contract (`/docs/openapi.json`) before deployment.

### 5.2 Deprecation & Sunset Header Standards (RFC 8594)
When an API endpoint or version is scheduled for deprecation, servers automatically inject RFC 8594 compliant HTTP response headers:
```http
Deprecation: true
Sunset: Sun, 03 Aug 2027 23:59:59 GMT
Link: <https://docs.my-saree-store.com/api/migration/v2>; rel="deprecation"; type="text/html"
```
- **Consumer Notification SLA**: Endpoints must announce deprecation at least **180 days** prior to sunsetting.

---

## 6. Enterprise Error Code Catalog & RFC 7807 Problem Details

For the complete taxonomy of error codes, see [ERROR_CATALOG.md](./ERROR_CATALOG.md).

All error responses return a standardized RFC 7807 `application/problem+json` payload with deterministic enterprise error codes to simplify frontend error handling, localization, and automated retry logic.

### 6.1 RFC 7807 Error Response Schema
```json
{
  "type": "https://api.my-saree-store.com/errors/CHECKOUT_001",
  "title": "Saree No Longer Available for Weaving or Purchase",
  "status": 409,
  "code": "CHECKOUT_001",
  "detail": "The 1-of-1 Banarasi Katan saree 'SR-BAN-8901' was reserved by another buyer 45 seconds ago.",
  "instance": "/api/v1/cart/checkout",
  "timestamp": "2026-08-03T03:49:00.000Z",
  "errorId": "req-uuid-9921-a4b2",
  "invalidParams": []
}
```

---

## 7. Request Tracing & Correlation

To ensure end-to-end observability across the modular monolith and external services:
- **`X-Request-ID`**: Generated by the Nginx edge proxy (or Express if missing) to uniquely identify a single HTTP request.
- **`X-Correlation-ID`**: Provided by the client (or generated if missing) to group a logical sequence of requests (e.g., a checkout flow).
- **`traceparent` (W3C)**: Used for OpenTelemetry distributed tracing context propagation to external services (Stripe, BullMQ, Gemini).

These headers are automatically injected into the Pino structured logger for every request.

---

## 8. Rate Limiting Headers

Rate limits are enforced at the Nginx edge and Express middleware layers. Responses include standard rate limit headers:
- `RateLimit-Limit`: Maximum requests permitted in the current window.
- `RateLimit-Remaining`: Remaining requests in the current window.
- `RateLimit-Reset`: UTC timestamp when the quota resets.
- `Retry-After`: Seconds to wait before retrying (sent on `429 Too Many Requests`).

---

## 9. Pagination, Filtering, & Sorting

### 9.1 Pagination Strategy
- **Cursor-Based Pagination (Default)**: Required for high-volume endpoints (e.g., `/api/v1/products`) to prevent deep-offset database scan penalties. Uses a base64 encoded cursor (`?cursor=eyJpZCI6IjEyMyJ9`).
- **Offset-Based Pagination**: Permitted only for low-volume administrative endpoints (e.g., `/api/v1/admin/users`) where total page calculation (`?page=2&limit=20`) is required.

### 9.2 Filtering & Sorting Conventions
We enforce a unified query convention across all endpoints:
- **Filtering**: `?filter[categoryId]=uuid` or `?filter[price][gte]=10000`.
- **Sorting**: `?sort=-createdAt,price` (prefix `-` indicates descending order).
- **Field Selection**: `?fields[products]=id,name,price` (for sparse fieldsets).
- **Inclusion (Relations)**: `?include=category,variants` (to eagerly load Prisma relations).

---

## 10. Idempotency & Conditional Requests

### 10.1 Idempotency Key Policy
Critical POST/PUT mutations mandate an `Idempotency-Key` header (UUIDv4) to safely retry requests in unstable network conditions.
- **Required For**: Checkout creation, Payment initiation, Refunds, Order cancellation, Inventory reservation, and Bulk Admin operations.
- **Scope & Expiry**: Keys are scoped to the user/actor and expire after 24 hours in Redis.
- **Conflict Behavior**: If a request is replayed with the same key while the original is still processing, a `409 Conflict` (or `425 Too Early`) is returned. If completed, the original cached response is returned.

### 10.2 Conditional Requests & Caching
Endpoints returning heavily read, rarely mutated data (e.g., Localization, CMS Banners) must support conditional HTTP caching:
- `ETag` / `If-None-Match`: The server calculates a hash of the response. If it matches the client's `If-None-Match`, it returns `304 Not Modified`.
- `Cache-Control`: Specifies TTL (`public, max-age=300`).
- `Vary`: Specifies headers that affect the response (e.g., `Vary: Accept-Language`).

## 11. Inventory & Warehouse Endpoints
### 11.1 Check Inventory Availability
- **Method / Path**: `GET /api/v1/inventory/:productId/availability`
- **Description**: Returns real-time inventory availability for a specific product.
- **Response**: `InventoryAvailabilityDto`.

### 11.2 Reserve Inventory
- **Method / Path**: `POST /api/v1/inventory/reserve`
- **Description**: Places a temporary hold (reservation) on inventory items for a checkout flow. Uses atomic locking.
- **Request Body**: `ReserveInventoryRequest` (productId, quantity, ttlSeconds).
- **Response**: `InventoryReservationDto`.
- **Idempotency**: Strongly recommended using `Idempotency-Key` or by explicitly handling the returned `reservationId`.

### 11.3 Release Inventory Reservation
- **Method / Path**: `POST /api/v1/inventory/reservations/:reservationId/release`
- **Description**: explicitly releases a reservation before its TTL expires (e.g., user abandoned checkout).
- **Response**: `{ success: true }`.

## 12. Order Endpoints (Post-Payment Lifecycle)
### 12.1 Get Order (Secure Guest Retrieval)
`GET /api/v1/orders/:orderId?accessToken=<opaque_token>`
Retrieves the authoritative order state, requiring the `accessToken` that was issued upon successful checkout session finalization.
**Response (Success)**
```json
{
  "data": {
    "id": "ord_...",
    "checkoutSessionId": "cs_...",
    "status": "CONFIRMED",
    "currency": "INR",
    "paymentStatus": "PAID",
    "subtotal": "55000.00",
    "taxTotal": "0",
    "shippingTotal": "0",
    "total": "55000.00",
    "accessToken": "tok_123456789",
    "lines": [...],
    "history": [...],
    "createdAt": "2026-08-18T10:00:00Z"
  }
}
```

### 12.2 Cancel Order
`POST /api/v1/orders/:orderId/cancel`
Cancels an order if it is in `PAYMENT_PENDING` or `CONFIRMED` state. Requires `accessToken` via query string or `x-order-token` header. Note: The database now securely stores a SHA-256 hash of the token; the raw token is returned exactly once during order confirmation. Exact rollback of consumed inventory is performed atomically.

### 12.3 Prepare Fulfillment
`POST /api/v1/orders/:orderId/prepare-fulfillment`
Transitions the order from `CONFIRMED` to `READY_FOR_FULFILLMENT` and locks out future cancellations. Emits a `FulfillmentHandoff` record. Requires `accessToken` via query string or `x-order-token` header.

### 12.4 Get Order Shipment Tracking
`GET /api/v1/orders/:orderId/shipment`
Retrieves shipment status and tracking details for a specific order. Requires `accessToken` via query string or `x-order-token` header.
**Response (Success)**
```json
{
  "id": "shp_123...",
  "orderId": "ord_...",
  "provider": "MockProvider",
  "trackingNumber": "AWB12345678",
  "status": "DISPATCHED",
  "shippingAddress": { ... },
  "dispatchedAt": "2026-08-19T10:00:00Z",
  "deliveredAt": null,
  "createdAt": "2026-08-19T09:00:00Z"
}
```

### 12.5 Shipping Provider Webhook
`POST /api/v1/shipping/webhook`
Receives asynchronous shipping events from the external provider.
Requires `x-shipping-signature` header for HMAC verification.
```json
{
  "providerShipmentId": "shp_123",
  "status": "DELIVERED",
  "timestamp": "2026-08-19T12:00:00Z",
  "eventId": "evt_abc123"
}
```
