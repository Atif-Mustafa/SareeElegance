# Enterprise Headless CMS & Dynamic Merchandising Content Architecture — Luxury Saree Platform

---

## 1. Executive Summary & CMS Philosophy
A luxury saree e-commerce platform relies on evocative storytelling, rich visual merchandising, and seasonal campaign dynamism. To support high-frequency editorial updates without engineering intervention or application redeployments, our platform implements a **Decoupled Headless CMS Architecture** integrated with PostgreSQL, Express.js REST APIs (`/api/v1/content/*`), and Redis edge caching.

---

## 2. CMS Entity Taxonomy & Content Models

```
+---------------------------------------------------------------------------------+
|                          ENTERPRISE HEADLESS CMS ENGINE                         |
|                                                                                 |
|  +--------------------+  +--------------------+  +---------------------------+  |
|  |     HeroBanner     |  | PromotionalRibbon  |  |       HeritageStory       |  |
|  | (PDP/PLP/Home Hero)|  |  (Top Bar Alert)   |  | (Artisan/Weave Editorial) |  |
|  +---------+----------+  +---------+----------+  +-------------+-------------+  |
|            |                       |                           |                |
|            +-----------------------+---------------------------+                |
|                                    |                                            |
|                                    v                                            |
|  +---------------------------------------------------------------------------+  |
|  |                         DynamicPage / LandingPage                         |  |
|  |       (Lookbooks • Festival Pages • SEO Landing Pages • FAQ Guides)       |  |
|  +---------------------------------+-----------------------------------------+  |
|                                    |                                            |
|                                    v                                            |
|  +---------------------------------------------------------------------------+  |
|  |                  ContentBlock / Reusable Dynamic Block                    |  |
|  | (HeroCarousel • WeaveSpotlight • ArtisanQuote • VideoPlayer • SareeGrid)  |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

## 3. Core Content Schemas

### 3.1 `HeroBanner` & `PromotionalRibbon` Schema
- **`HeroBanner`**: High-impact promotional banners for Homepage, Category Landing Pages, and Seasonal Lookbooks.
  - Fields: `id`, `locale`, `title`, `subtitle`, `desktopImageUrl` (3840x1600 AVIF/WebP), `mobileImageUrl` (1080x1350 vertical ratio), `ctaText`, `ctaUrl`, `priority`, `startDate`, `endDate`, `isActive`.
- **`PromotionalRibbon`**: Global header alerts (e.g., *"Complimentary DDP Worldwide Express Shipping on Orders Over $350"*).
  - Fields: `id`, `locale`, `messageText`, `linkUrl`, `bgHexColor`, `textHexColor`, `startDate`, `endDate`, `isActive`.

### 3.2 `HeritageStory` (Artisan & Weaving Tradition Editorial)
- Encapsulates cultural weave histories, loom techniques (Banarasi Kadwa, Kanchipuram Korvai, Chanderi Eknal), and master artisan profiles.
- **Key Fields**: `id`, `slug` (unique SEO URL), `weaveType`, `title`, `summary`, `richContent` (Structured JSON block or sanitized Markdown), `artisanName`, `region`, `heroImageUrl`, `loomVideoUrl`, `relatedProductIds` (Array of saree UUIDs for direct "Shop This Weave" merchandising).

### 3.3 `DynamicPage`, Festival Pages & Lookbooks (`LandingPage`)
- Supports dynamic creation of seasonal campaigns (*"Diwali Heritage Capsule 2026"*, *"The Banarasi Bridal Lookbook"*, *"Art of Zari Purity"*).
- Composed of modular **Dynamic Content Blocks** (`ContentBlock`) rendered in sequence by the React 19 frontend.
- **Supported Block Types**:
  1. `HERO_SPLIT_BANNER`: Half-screen image + editorial text.
  2. `WEAVE_SPOTLIGHT`: Interactive weave macro zoom card with silk specifications.
  3. `ARTISAN_QUOTE`: Callout typography block highlighting master weaver interviews.
  4. `CURATED_SAREE_GRID`: Dynamic SKU query builder embedding up to 8 live sarees (`filterByWeave`, `filterByColor`, `filterByOccasion`).
  5. `LOOM_VIDEO_EMBED`: Auto-playing muted 4K loom video loop.

### 3.4 FAQ Guides & Saree Care Instructions (`FaqEntry`)
- Modular FAQ blocks categorized by theme (`INTERNATIONAL_SHIPPING`, `SILK_MARK_AUTHENTICITY`, `SAREE_CARE_STORAGE`, `RETURN_POLICY`).
- Directly integrated into both PDP accordion tabs and dedicated `/faqs` pages with automatic JSON-LD FAQPage schema generation.

---

## 4. Merchandising Workflows & Time-Bound Scheduling

### 4.1 Campaign Scheduling & Automated Sunset
Merchandisers configure `startDate` and `endDate` timestamps for seasonal sales. Backend content controllers filter out expired or unlaunched banners using PostgreSQL timestamp bounds:
```ts
where: {
  isActive: true,
  locale: req.query.locale,
  startDate: { lte: new Date() },
  endDate: { gte: new Date() }
}
```

### 4.2 Instant Cache Invalidation & Redis Edge Publishing
- All public content queries (`GET /api/v1/content/banners`, `GET /api/v1/content/stories`) are cached in Redis with an `1800s` (30-minute) TTL.
- When an admin updates a CMS banner or blog post via the Admin API (`PUT /api/v1/admin/content/banners/:id`), the backend immediately executes pattern-based cache eviction (`redis.del('cms:banners:*')`), guaranteeing instantaneous content publication without server restarts.

---

## 5. React 19 Dynamic Rendering & Fallback Governance
- **TanStack Query Integration**: Frontend views consume CMS endpoints using structured cache keys (`['cms', 'banners', activeLocale]`) with a 30-minute stale time.
- **Graceful Fallback Policy**: If a regional locale banner (e.g., `hi-IN`) is unconfigured, the API automatically falls back to default English (`en-IN`) content, ensuring zero visual layout holes on the storefront.
