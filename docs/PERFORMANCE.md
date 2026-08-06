# Enterprise Performance & Frontend Bundle Optimization Architecture — Luxury Saree Platform

---

## 1. Executive Summary & Performance SLAs
Luxury e-commerce shoppers demand instantaneous responsiveness, fluid animations, and high-fidelity product photography without visual stutter or layout jitter. Our engineering standards enforce strict Service Level Agreements (SLAs) across all customer-facing views:

| Performance Metric | Enterprise SLA Target | Measured Component |
| :--- | :--- | :--- |
| **Largest Contentful Paint (LCP)** | `< 1.8 seconds` | Hero Saree Banner or PDP primary zoom image |
| **Interaction to Next Paint (INP)** | `< 100 milliseconds` | Saree color swatch click, filter toggle, add-to-cart action |
| **Cumulative Layout Shift (CLS)** | `< 0.05` | Zero layout shift during font rendering or banner loading |
| **API Response Latency (p95)** | `< 150 milliseconds` | Catalog queries (`GET /api/v1/products`) |
| **Cached API Latency (p99)** | `< 25 milliseconds` | Redis-cached localization config (`GET /api/v1/localization/config`) |
| **Lighthouse Performance Score** | `> 95 / 100` | Tested on simulated 4G mobile devices |

---

## 2. Frontend Performance & Bundle Optimization (React 19 + Vite)

### 2.1 Route-Level Code Splitting & Lazy Loading
- React 19 `React.lazy` and `<Suspense>` are mandatory for all top-level routes (`/src/pages/*`) and heavy modals (`CountrySwitcherModal`, `BlouseCustomizerDrawer`, `AIConciergeDrawer`):
  ```tsx
  const ProductDetailPage = React.lazy(() => import('./pages/PDP'));
  ```
- **JavaScript Bundle Budgets**:
  - Initial vendor bundle (`react`, `react-dom`, `react-router`): Max `140 KB` gzipped.
  - Initial route-specific JS payload: Max `60 KB` gzipped.
  - Heavy graphing or visualization libraries (`d3`, `recharts`, `framer-motion` complex trees) must be dynamically loaded on demand via explicit dynamic imports (`import('recharts')`).

### 2.2 Next-Gen Saree Image & Video Delivery Pipeline
- Every saree photograph is served via CDN in AVIF or WebP format with automated compression.
- **Responsive Resolution Scaling (`srcSet` & `sizes`)**:
  ```html
  <img
    src="saree-md.webp"
    srcSet="saree-sm.webp 640w, saree-md.webp 1024w, saree-lg.webp 1920w"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    loading="lazy"
    decoding="async"
  />
  ```
- **Shimmer Placeholders & Layout Shift Prevention**: All product cards implement CSS shimmer skeleton placeholders (`/src/components/product/ProductCardSkeleton.tsx`) with explicit aspect-ratio containers (`aspect-[3/4]`) to prevent layout shifts (CLS).

### 2.3 Virtualization for Large Saree Catalogs
- When displaying extended lookbooks or PLP grids exceeding 100 sarees, components utilize virtualized list rendering (`@tanstack/react-virtual`) to maintain a constant DOM node count under 1,500 elements, ensuring smooth 60 FPS scrolling.

---

## 3. Multi-Layer Caching Hierarchy & Edge Strategy

```
+---------------------------------------------------------------------------------+
|                         MULTI-LAYER CACHING HIERARCHY                           |
|                                                                                 |
|  [L1: Browser Cache]         -> HTTP Cache-Control / ETag (365 days for assets) |
|  [L2: TanStack Query Cache]  -> In-Memory Client State Cache (5 min - 1 hour)   |
|  [L3: Nginx / Cloudflare]    -> CDN Reverse Proxy Asset & Page Cache            |
|  [L4: Redis Server Cache]    -> API JSON Payloads & Live Exchange Rates (TTL)   |
|  [L5: PostgreSQL Pooler]     -> PgBouncer Transaction Pool & Shared Buffers     |
+---------------------------------------------------------------------------------+
```

### 3.1 Redis Caching Policies (`/src/server/cache`)
- Active Countries & Languages (`GET /api/v1/localization/config`): `TTL = 3600s` (1 hour).
- Live Multi-Currency Exchange Rates (`GET /api/v1/currencies/rates`): `TTL = 3600s` (1 hour, background refreshed by BullMQ worker).
- Catalog PLP Page Queries (`GET /api/v1/products?page=1`): `TTL = 300s` (5 minutes).

### 3.2 Enterprise Cache Invalidation Matrix & Stampede Prevention
- **Cache Stampede / Dog-Piling Prevention**: High-traffic cached keys (`cache:localization:config`, `cache:products:plp:default`) implement **Probabilistic Early Expiration (XFetch algorithm)** and **Stale-While-Revalidate (`s-maxage=300, stale-while-revalidate=60`)** headers. When a key is near expiry, a single background request refreshes the cache while concurrent shoppers continue receiving stable cached bytes.
- **Automated Cache Invalidation Matrix**:

| Domain Mutation | Trigger Endpoint / Event | Redis Key Patterns Evicted | TanStack Query Tags Invalidated |
| :--- | :--- | :--- | :--- |
| **Saree Price / Stock Update** | `PUT /api/v1/admin/products/:id` | `cache:products:*`, `cache:saree:{id}` | `['products']`, `['saree', id]` |
| **Exchange Rate Sync** | BullMQ Cron Job / Manual Admin | `cache:rates:latest`, `cache:localization:*` | `['currencies']`, `['localization']` |
| **CMS Banner Edit** | `PUT /api/v1/admin/cms/banners/:id` | `cache:cms:banners:*` | `['cms', 'banners']` |
| **1-of-1 Saree Checkout** | Event: `inventory.reserved` | `cache:saree:{id}`, `cache:products:*` | `['saree', id]`, `['products']` |

---

## 4. Database Optimization & Query Engineering (PostgreSQL + Prisma)

- **Composite Indexing**: High-frequency filter attributes use composite B-tree indexes (`@@index([isActive, categoryId, priceINR])`, `@@index([slug, isActive])`).
- **N+1 Query Prevention**: Always use Prisma `include` or explicit relational `select` blocks to fetch associated variants, saree images, and artisan profiles in a single SQL query.
- **Connection Pooling (`PgBouncer`)**: Configured in transaction pooling mode (`pool_mode = transaction`) with `DATABASE_POOL_SIZE=20` to prevent PostgreSQL connection exhaustion during festive flash sales.
- **Keyset / Cursor Pagination**: All REST APIs serving paginated saree lists (`GET /api/v1/products`) support cursor-based pagination (`cursor: { id }`) alongside standard offset pagination to eliminate database scan penalties on deep pages.

---

## 5. Next-Gen Saree Photography Image & CDN Pipeline

To render hand-woven Zari embroidery, Kadwa brocade texture, and silk luster with museum-grade visual fidelity without sacrificing LCP SLAs, the platform implements an end-to-end media pipeline:

```
+---------------------------------------------------------------------------------+
|                         ENTERPRISE CDN & IMAGE PIPELINE                         |
|                                                                                 |
|  [Raw TIFF/PNG Photography]                                                     |
|       |                                                                         |
|       v  (Automated CI/Worker Upload)                                           |
|  [Image Processing Engine (Sharp/Cloudflare Image Resizing)]                    |
|       |                                                                         |
|       +---> AVIF (Priority format for Safari 16+ & Chrome, 40% smaller)          |
|       +---> WebP (Fallback format for evergreen mobile browsers)                 |
|       +---> Macro Zoom Tiles (2048x2048 tiles for Zari thread inspection)       |
|       |                                                                         |
|       v                                                                         |
|  [Cloudflare Edge CDN] -> Cache-Control: public, max-age=31536000, immutable    |
+---------------------------------------------------------------------------------+
```

### 5.1 Macro Zoom & Zari Inspection Architecture
- Saree PDPs offer an interactive **6x Macro Zoom** canvas. Instead of loading a monolithic 25 MB photograph on initial page load, the viewer dynamically fetches optimized `512x512` image tiles on hover/pan using deep-zoom coordinate tiling.
- **Responsive Breakpoint Standards**: All saree thumbnail grids enforce explicit aspect ratios (`aspect-[3/4]`) and generate 4 responsive variants (`sm: 640w`, `md: 1024w`, `lg: 1440w`, `xl: 1920w`).
- **CDN Edge Cache Headers**: All static saree assets are immutable (`Cache-Control: public, max-age=31536000, immutable`), relying on content-hashed filenames (`/assets/sarees/banarasi-katan-8901.a8f9d2.avif`) to guarantee zero CDN revalidation overhead.
