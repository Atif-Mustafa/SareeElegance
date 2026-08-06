# Enterprise Caching Strategy

---

## 1. Executive Summary

To achieve our `< 1.8s LCP` and `< 150ms API Latency` SLAs across global audiences, the platform utilizes a sophisticated multi-layer caching hierarchy. 

**STRICT RESTRICTION**: Private user information, active carts, access-controlled admin data, and personalized account responses (wishlists, profiles) **MUST NEVER** be cached in shared edge layers or public CDN nodes.

---

## 2. Multi-Layer Caching Hierarchy

```
+---------------------------------------------------------------------------------+
|                         MULTI-LAYER CACHING HIERARCHY                           |
|                                                                                 |
|  [L1: Browser Cache]         -> HTTP Cache-Control / ETag (365 days for assets) |
|  [L2: TanStack Query Cache]  -> In-Memory Client State Cache (5 min - 1 hour)   |
|  [L3: CDN Reverse Proxy]     -> Cloudflare/Nginx Edge Cache (Static Assets)     |
|  [L4: Redis Server Cache]    -> API JSON Payloads, Rates, Config (TTL-based)    |
|  [L5: PostgreSQL Pooler]     -> PgBouncer Transaction Pool & Shared Buffers     |
+---------------------------------------------------------------------------------+
```

---

## 3. Caching Patterns & Policies

### 3.1 Redis Caching Policies (`/src/server/cache`)
We employ **Cache-Aside** and **Stale-While-Revalidate** patterns to prevent dog-piling / stampedes.

| Domain Data | Cache Key Pattern | TTL | Source of Truth |
| :--- | :--- | :--- | :--- |
| **Active Countries/Langs** | `cache:localization:config` | 3600s | PostgreSQL |
| **Exchange Rates** | `cache:rates:latest` | 3600s | OpenExchangeRates/DB |
| **Catalog PLP (Page 1)** | `cache:products:plp:default` | 300s | PostgreSQL |
| **Saree PDP Data** | `cache:saree:{id}` | 600s | PostgreSQL |
| **CMS Banners** | `cache:cms:banners:*` | 1800s | PostgreSQL |
| **Similar Recommendations** | `ai:similar:{productId}` | 86400s | pgvector |

### 3.2 Cache Invalidation & Triggers

Cache invalidation is primarily event-driven via BullMQ or synchronized Express controller hooks.

| Domain Mutation Event | Redis Keys Evicted | TanStack Query Tags Invalidated |
| :--- | :--- | :--- |
| **ProductUpdated** / Price Change | `cache:products:*`, `cache:saree:{id}` | `['products']`, `['saree', id]` |
| **ExchangeRatesUpdated** | `cache:rates:latest`, `cache:localization:*`| `['currencies']`, `['localization']` |
| **CMSContentPublished** | `cache:cms:banners:*` | `['cms', 'banners']` |
| **InventoryReserved** (Checkout)| `cache:saree:{id}`, `cache:products:*` | `['saree', id]`, `['products']` |

### 3.3 Stampede Protection (XFetch)
High-traffic keys (e.g., PLP defaults) utilize probabilistic early expiration. A background worker refreshes the cache asynchronously just before the TTL expires, ensuring zero latency spikes for the end user.

---

## 4. HTTP Cache Headers & Conditional Requests
- **Static Assets (JS, CSS, Fonts, Images)**: `Cache-Control: public, max-age=31536000, immutable`
- **Dynamic API Responses (Public Data)**: Use `ETag` and evaluate `If-None-Match` to return `304 Not Modified` when applicable.
- **Private Data (User Profile, Cart)**: `Cache-Control: private, no-cache, no-store, must-revalidate`

---

## 5. Frontend TanStack Query Strategy
TanStack Query acts as the L2 cache for the React UI.
- **Stale Time**: 5 minutes for product data; 0 for carts and user profiles.
- **Garbage Collection Time (gcTime)**: 30 minutes for unused queries.
