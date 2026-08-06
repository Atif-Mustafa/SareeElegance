# Enterprise E-Commerce Discovery, Faceted Search & Filtering Architecture — Luxury Saree Platform

---

## 1. Executive Summary & Search Engine Architecture
A luxury saree catalog requires an intelligent discovery engine capable of parsing specialized Indian textile terminology, weaving techniques, and regional colloquialisms. Our search architecture utilizes a **Hybrid Search Engine Model** combining **PostgreSQL Full-Text Search (GIN-indexed `tsvector`)** for zero-latency transactional consistency with **Elasticsearch/Meilisearch synchronization via BullMQ** for high-throughput autocomplete, fuzzy matching, and multi-attribute faceted aggregation.

---

## 2. Multi-Attribute Faceted Navigation Architecture

Our product discovery engine calculates real-time faceted counts across 7 core textile merchandising dimensions:
```
1. Fabric (Katan Silk, Tussar Silk, Chanderi, Georgette, Organza, Muga Silk, Cotton-Silk)
2. Weave Technique (Kadwa, Kadhuan, Jamdani, Shikargah, Tanchoi, Kutni, Meenakari)
3. Primary Motif (Kalka/Paisley, Floral Buti, Ashrafil/Coin Jaal, Geometric Temple)
4. Color Palette (Crimson Red, Emerald Green, Royal Peacock Blue, Mustard Yellow, Pastel Pink)
5. Zari Purity Grade (Real Silver Gold-Plated, Tested Zari, Metallic Zari)
6. Occasion (Bridal, Wedding Guest, Temple Ceremony, Festive Evening, Heirloom Collection)
7. Price Bracket (Under ₹15,000 | ₹15,000–₹35,000 | ₹35,000–₹75,000 | ₹75,000+ Heirloom)
```

### 2.1 Standardized API Facet Response Structure (`GET /api/v1/search`)
When filtering sarees, the Express API returns matching SKUs and dynamically calculated facet counts in a single payload:
```json
{
  "success": true,
  "data": {
    "products": [ /* ... array of ProductCard DTOs ... */ ],
    "facets": {
      "fabrics": [
        { "label": "Katan Silk", "count": 42, "isSelected": true },
        { "label": "Tussar Silk", "count": 18, "isSelected": false },
        { "label": "Chanderi", "count": 14, "isSelected": false }
      ],
      "colors": [
        { "label": "Crimson Red", "count": 25, "hex": "#DC143C", "isSelected": true },
        { "label": "Royal Peacock Blue", "count": 19, "hex": "#005F73", "isSelected": false }
      ],
      "zariGrades": [
        { "label": "Real Silver Gold-Plated", "count": 22, "isSelected": false },
        { "label": "Tested Zari", "count": 34, "isSelected": false }
      ]
    },
    "pagination": {
      "totalItems": 42,
      "currentPage": 1,
      "totalPages": 4
    }
  }
}
```

---

## 3. Relevancy Scoring, Typo Tolerance & Synonym Dictionaries

### 3.1 Weighted Relevancy Ranking
Search results are ordered by a composite relevancy score calculated across weighted textile fields:
- **Exact Saree Title & SKU Match**: Weight `x10`
- **Weave Technique & Fabric Attribute Match**: Weight `x5`
- **Artisan Cluster & GI Region Match**: Weight `x3`
- **Heritage Storytelling Text Match**: Weight `x1.5`
- **Stock Availability Boost**: In-stock items receive a `+25%` score boost; out-of-stock archival sarees are demoted to the final pages of search results.

### 3.2 Indian Textile Synonym & Phonetic Mapping Dictionary
To accommodate regional spelling variations and phonetic transliterations, our search pipeline applies automated synonym normalization before query execution:
- `"Banarsi"` ↔ `"Banarasi"`
- `"Kanjeevaram"` ↔ `"Kanchipuram"`
- `"Zaree"` ↔ `"Zari"`
- `"Sari"` ↔ `"Saree"`
- `"Odhori"` ↔ `"Chunri"` ↔ `"Dupatta"`
- `"Kalka"` ↔ `"Paisley"`
- `"Buti"` ↔ `"Booti"` ↔ `"Buta"`

---

## 4. Search Autocomplete, Trending Queries & Zero-Result Telemetry

### 4.1 Sub-50ms Instant Autocomplete (`GET /api/v1/search/suggest`)
- Serves instant autocomplete suggestions as the user types, returning:
  - Top 4 matching Saree Titles with thumbnail previews and INR/USD pricing.
  - Top 3 matching Weave Categories (e.g., *"Banarasi Katan in Sarees"*).
  - Top 3 Popular / Trending Searches (e.g., *"Bridal Red Brocade"*, *"Organza Pastel"*).

### 4.2 Recent Searches & Trending Keywords Cache
- User recent searches are persisted in browser LocalStorage (`saree_recent_searches`, max 5 entries) for instant UI recall.
- Trending searches are aggregated across PostgreSQL search logs and cached in Redis (`search:trending:keywords`) with a 4-hour TTL.

### 4.3 Zero-Result Query Telemetry (`SearchAnalytics` Table)
- When a search query returns zero matching sarees, the query string, user locale, and timestamp are recorded in PostgreSQL:
  ```prisma
  model SearchAnalytics {
    id         String   @id @default(uuid())
    query      String
    resultCount Int
    locale     String
    ipAddress  String
    createdAt  DateTime @default(now())
  }
  ```
- This telemetry alerts merchandisers to unmet catalog demand or missing synonym mappings.

---

## 5. Enterprise Search Ranking Detail & Evaluation

### 5.1 Proposed Ranking Factors (Hypotheses)
The exact weights for the search algorithm are hypotheses requiring analytics validation in production. Initial proposed weighting (using Elasticsearch/Meilisearch functions):
- **Exact Title Match**: 100
- **Prefix Title Match**: 75
- **Saree Type / Fabric Match**: 50
- **Weave / Motif / Region Match**: 40
- **Occasion / Color Match**: 30
- **Popularity Boost**: +0-20 (Log-normalized sales velocity over 30 days)
- **Conversion Rate Boost**: +0-15
- **Merchandising Boost**: Admin manual override multiplier (x1.0 - x2.0) for featured campaigns.
- **Recency**: +10 for newly added heritage weaves.

### 5.2 Query Normalization & Typo Tolerance
- **Typo Tolerance**: Allowed distance of 1 character for words > 4 chars, 2 characters for words > 8 chars.
- **Stop Words**: Ignored terms in English (`the`, `with`, `for`) and Hindi transliterations (`ke`, `ki`).
- **Stemming**: Custom stemming configuration required for Indian textiles to prevent "Banarasis" from mismatching "Banarasi".

### 5.3 Zero-Result Recovery
If standard query execution yields 0 results:
1. Strip all stop words and retry with `OR` operator instead of `AND`.
2. Relax typo tolerance.
3. If still 0 results, return a curated fallback: "Trending Bridal Styles" + "New Arrivals".

### 5.4 Search Quality Metrics (KPIs)
- **Click-Through Rate (CTR)** on Top 5 results.
- **Search-to-Cart Conversion Rate**.
- **Zero-Result Rate** (Target < 2%).
- **Mean Reciprocal Rank (MRR)**.
