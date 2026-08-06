# Enterprise Analytics & Experimentation Architecture

---

## 1. Executive Summary

To optimize the luxury buyer journey and measure conversion funnels, we implement a consent-aware, privacy-first event tracking taxonomy.

**Architectural Decision**: For the initial rollout, we employ a minimal analytics stack utilizing **Google Analytics 4 (GA4)** via standard client-side tags respecting Google Consent Mode v2, and server-side tracking for critical events. A more complex data warehouse export (e.g., BigQuery) is a future capability.

---

## 2. Standardized Event Taxonomy

All events follow an action-object naming convention (`object_action`).

### 2.1 E-Commerce Core Funnel
- `product_viewed`: User views a PDP. (Properties: `productId`, `price`, `currency`, `category`).
- `product_image_zoomed`: User interacts with the macro-Zari zoom.
- `search_performed`: User uses the search bar. (Properties: `query`, `resultCount`).
- `filter_applied`: User narrows PLP. (Properties: `filterType`, `value`).
- `product_added_to_cart`: (Properties: `productId`, `cartTotal`).
- `checkout_started`: User enters shipping details.
- `payment_completed`: Successful charge. (Properties: `transactionId`, `value`, `currency`).
- `order_placed`: Order confirmed in DB.

### 2.2 Engagement & Storytelling
- `heritage_story_viewed`: User reads a weaving editorial.
- `artisan_profile_viewed`: User views the weaver's biography.
- `concierge_opened`: User launches the AI assistant.
- `concierge_recommendation_clicked`: User clicks an AI-suggested saree.

---

## 3. Privacy & Consent Rules

- **Consent Requirement**: Events mapped to marketing/advertising (Meta Pixel) strictly require explicit user opt-in (`marketing_consent: granted`).
- **PII Restrictions**: Customer email addresses, street addresses, and phone numbers are **NEVER** transmitted to GA4 or frontend analytics scripts.
- **Server-Side Tracking**: Critical financial events (`payment_completed`, `order_placed`) are dispatched server-side from the Express backend to ensure accuracy regardless of browser ad-blockers, but still strictly omit PII.

---

## 4. Experimentation (A/B Testing)

Experimentation ties closely into the Feature Flag architecture.
- **Assignment**: Users are bucketted into Control (A) or Variant (B) deterministically via a hash of their session UUID.
- **Exposure Tracking**: When a user sees a variant, an `experiment_viewed` event fires to Analytics.
- **Guardrail Metrics**: Tests measuring UI changes (e.g., button colors) must monitor guardrail metrics like overall Conversion Rate and Page Load Time to ensure business logic is not degraded.
