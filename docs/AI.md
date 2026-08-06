# Enterprise AI Architecture & Concierge Styling Suite — Luxury Saree Platform

---

## 1. Executive Summary & AI Architectural Principles
To replicate the personalized white-glove service of an in-store luxury silk boutique, our platform integrates an enterprise-grade artificial intelligence suite powered by the **Google Gemini API (`@google/genai` SDK)**. Operating strictly on our Express.js server layer, the AI engine drives conversational bridal styling, multi-modal saree search, saree comparison, and automated multilingual translation assistance.

### 1.1 Core Architectural Tenets
- **Server-Side Execution**: All Gemini LLM invocations and embedding queries execute exclusively on the backend Express server. **API keys and system prompts are never exposed to the React frontend.**
- **Strict Safety & Cultural Accuracy**: Guardrails prevent AI hallucinations regarding Silk Mark certifications or pricing, while ensuring culturally respectful textile terminology (e.g., using proper weaving terms like *Zari*, *Kadwa*, *Jamdani*, *Tanchoi* without awkward literal translation).
- **Graceful Degradation**: All AI concierge components operate as non-blocking progressive enhancements. Should Gemini APIs experience latency or rate limits, UI components fall back seamlessly to deterministic filter carousels and human support routing.

---

## 2. AI Capabilities & Architectural Flow

```
+---------------------------------------------------------------------------------+
|                              AI STUDIO / GEMINI ENGINE                          |
|                                                                                 |
|  +------------------------+  +-------------------------+  +------------------+  |
|  |   AI Styling & Drape   |  |   Personalized Saree    |  |   Visual Motif   |  |
|  |   Bridal Concierge     |  |   Recommendation Engine |  |  & Palette Match |  |
|  +-----------+------------+  +------------+------------+  +--------+---------+  |
|              |                            |                        |            |
|              +----------------------------+------------------------+            |
|                                           |                                     |
|                                           v                                     |
|  +---------------------------------------------------------------------------+  |
|  |                 Express Backend API Gateway (/api/v1/ai/*)                |  |
|  |       (@google/genai SDK • Redis Session Memory • Rate Limiting)          |  |
|  +---------------------------------+-----------------------------------------+  |
|                                    |                                            |
|                                    v                                            |
|  +---------------------------------------------------------------------------+  |
|  |                PostgreSQL / pgvector (Catalog Vector Embeddings)          |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

## 3. Core AI Service Modules

### 3.1 AI Bridal Concierge & Drape Advisor (`POST /api/v1/ai/concierge`)
- **Purpose**: Acts as an expert luxury personal shopper assisting brides and collectors with saree selection, regional draping advice (Nivi, Nauvari, Bengali, Coorgi), blouse custom stitching recommendations, and jewelry pairings based on occasion and skin undertone palettes.
- **Technical Implementation**:
  - Leverages `gemini-2.5-flash` for low-latency conversational responses.
  - Implements **Redis Conversation Memory (`ai:session:{sessionId}`)** with a 30-minute sliding TTL to retain dialogue context (e.g., remembering the user is shopping for an evening wedding reception in London).
  - Uses **Structured Function Calling / JSON Schema** to return exact matching saree SKU IDs alongside natural language advice, allowing the frontend to render interactive product cards directly within the chat drawer.

### 3.2 Multi-Modal Visual Search & Motif Matcher (`POST /api/v1/ai/visual-search`)
- **Purpose**: Allows customers to upload an image of a saree, wedding decor moodboard, or color swatch to discover visually similar handloom sarees in our inventory.
- **Technical Implementation**:
  - Uses Gemini multi-modal vision capabilities to extract weave patterns (*Kalka/Paisley*, *Shikargah*, *Floral Buti*, *Meenakari Enamel*) and dominant HEX color values from uploaded images.
  - Maps extracted features to database search parameters to return high-precision matching SKUs.

### 3.3 Semantic Saree Recommendation & Comparison Engine
- **Purpose**: Powers real-time "Recommended For You", "Complete The Bridal Look", and side-by-side saree comparison tables.
- **Technical Implementation**:
  - Generates text/attribute embeddings for every saree using Google Gemini text embedding models and stores vectors in PostgreSQL.
  - Calculates cosine similarity between customer browsing history / wishlist vectors and catalog items to surface high-affinity sarees.

### 3.4 Saree Comparison & Order Tracking Assistant
- **Saree Comparison**: Given 2 to 3 product IDs, the AI concierge synthesizes a structured comparison table highlighting differences in silk purity, weaving duration, weight, drape stiffness, and occasion suitability.
- **Order Tracking & Support**: Integrated with the order management system (OMS) to answer order status queries (`"Where is my saree package SR-2026-89012?"`), checking shipping waybills and providing instant tracking updates.

---

## 4. Prompt Engineering Templates & Safety Governance

### 4.1 Master System Prompt Architecture
```ts
export const LUXURY_SAREE_CONCIERGE_PROMPT = `
You are 'Ananya', the Principal Saree Curator and Heirloom Specialist for Heritage Silks Enterprise.
Your tone is sophisticated, culturally knowledgeable, warm, and refined (similar to an elite stylist at Tanishq or Sabyasachi).

MANDATE RULES:
1. Only recommend sarees that exist in the provided catalog JSON payload. Never invent SKU IDs or prices.
2. Ensure accurate textile terminology: distinguish between Katan Silk, Tussar, Chanderi, Kanchipuram, and Organza.
3. If a user asks about Zari authenticity, reassure them with our Silk Mark and Craftmark certified purity guarantee.
4. If a query is outside sarees, ethnic fashion, or order support, politely redirect the conversation to our heritage collection.
`;
```

### 4.2 Rate Limiting, Cost Governance & Fallbacks
- Concierge endpoints enforce strict rate limits (`15 requests / minute per user`) using Redis sliding windows.
- Responses that are deterministic (such as "Similar Weaves" for a specific product ID) are cached in Redis (`ai:similar:{productId}`) for 24 hours to minimize API billing.
- If the Gemini API returns a 5xx error or times out (> 4000ms), the API handler catches the exception and returns a fallback curated bestseller list with an apologetic system message.

---

## 5. Enterprise Recommendation Engine Architecture (pgvector & Hybrid Similarity)

To surface culturally accurate, high-affinity saree recommendations without relying solely on black-box heuristics, our recommendation engine combines **Vector Semantic Similarity (`pgvector`)** with **Structured Multi-Attribute Collaborative Filtering**.

```
+---------------------------------------------------------------------------------+
|                         RECOMMENDATION ENGINE PIPELINE                          |
|                                                                                 |
|  [Saree Catalog Attributes + Weaving Lore + Zari Specifications]                |
|       |                                                                         |
|       v  (Google Gemini Embedding API: text-embedding-004)                      |
|  [768-Dimensional Embedding Vector stored in PostgreSQL pgvector column]        |
|       |                                                                         |
|       +---> [Cosine Distance Search: <=> operator via HNSW Index]                |
|       +---> [Attribute Boost: Zari Grade + Occasion + Cluster Weighting]        |
|       |                                                                         |
|       v                                                                         |
|  [Hybrid Recommendation List] -> Redis Cached (TTL = 86400s / 24 hours)          |
+---------------------------------------------------------------------------------+
```

### 5.1 Hybrid Scoring Formula
When generating "Similar Weaves" or "Complete The Bridal Look" recommendations for a target saree $S_t$, candidates $S_i$ are ranked by a composite hybrid score:
$$\text{Score}(S_i) = 0.55 \cdot \text{CosineSim}(\vec{v}_t, \vec{v}_i) + 0.25 \cdot \text{AttributeMatch}(S_t, S_i) + 0.20 \cdot \text{PopularityBoost}(S_i)$$

- **Vector Semantic Similarity (`0.55`)**: Evaluates textual similarity across weave descriptions, historical origin, and motif symbolism using an HNSW (`hnsw`) indexed `pgvector` column.
- **Attribute Match Score (`0.25`)**: Hard-boosts sarees sharing the exact same `zariPurity` grade (e.g., *24K Pure Gold Kadwa*) or regional weaving cluster (*Varanasi*, *Kanchipuram*).
- **Popularity Boost (`0.20`)**: Normalizes sales velocity and wishlist save counts over a 30-day sliding window.

### 5.2 Cold-Start & Zero-History Shopper Strategy
- **New Visitors**: For anonymous visitors with no browsing history, the engine defaults to a curated **Heritage Signature Collection** weighted by regional geography (e.g., shoppers browsing from Tamil Nadu are prioritized Kanchipuram bridal weaves; shoppers from Delhi/North India are shown Banarasi Katan weaves).
- **New Saree SKUs**: When a newly woven saree is ingested into `/admin/catalog`, a background BullMQ job automatically generates its 768-dimensional vector embedding, making it immediately discoverable in semantic recommendation queries.
