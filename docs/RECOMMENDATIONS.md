# Enterprise Recommendation Engine Architecture

---

## 1. Executive Summary

To surface culturally accurate, high-affinity saree recommendations without relying solely on black-box heuristics, our recommendation engine utilizes a phased implementation strategy, scaling from deterministic rules to hybrid semantic AI.

---

## 2. Phased Implementation Strategy

### 2.1 Phase 1: Rule-Based Deterministic Recommendations (Current MVP)
Uses structured PostgreSQL queries based on catalog metadata.
- **Similar Weaves**: Matches sarees sharing the same `weaveId` (e.g., Banarasi) and `fabricId` (e.g., Katan Silk).
- **Similar Motifs**: Matches specific traditional patterns (e.g., *Shikargah*, *Kalka*).
- **Recently Viewed**: Stored in a lightweight browser `localStorage` queue (max 10 items) and hydrated via a single API batch fetch.

### 2.2 Phase 2: Behavioral Filtering (Next Milestone)
Integrates analytics event data to surface crowdsourced trends.
- **Trending / Bestsellers**: Aggregates `order_placed` and `product_viewed` events over a 7-day sliding window.
- **Frequently Bought Together**: Analyzes historical cart co-occurrences (e.g., matching a Kanchipuram saree with specific blouse fabrics).

### 2.3 Phase 3: Hybrid Semantic AI (`pgvector`)
Integrates Vector Semantic Similarity with attribute boosting.
- Uses `text-embedding-004` (Google Gemini) to generate 768-dimensional embeddings for each saree based on its description, lore, and visual styling.
- Executes Cosine Distance searches (`<=>`) in PostgreSQL via an HNSW index, weighted alongside deterministic rules (e.g., hard-filtering out out-of-stock items).

---

## 3. Filtering & Availability Constraints

All recommendation candidate sets MUST be filtered through business constraints before presentation to the user:
- **Availability**: Out-of-stock 1-of-1 sarees must be filtered out or heavily penalized in ranking.
- **Country Eligibility**: Certain heavy zari sarees may have shipping restrictions; recommendations respect the user's active country session.

---

## 4. Cold Start Strategy

- **New Users**: Visitors with no history receive a curated "Heritage Signature Collection" heavily weighted by popularity and regional geography.
- **New Products**: When a new saree is published, its embedding is generated synchronously via BullMQ, ensuring it is immediately discoverable as a "Similar Saree" without waiting for overnight batch jobs.
