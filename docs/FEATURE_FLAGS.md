# Enterprise Feature Flags & Experimentation

---

## 1. Executive Summary

Feature Flags (Toggles) enable progressive delivery, kill switches, and safe deployment of high-risk capabilities without requiring immediate code rollbacks. 

**Architectural Decision**: For the current maturity stage of the project, we implement a **small internal PostgreSQL/Redis-backed feature flag system**. We do not introduce a third-party platform (like LaunchDarkly or Unleash) until multi-environment complexity justifies the licensing and SDK footprint.

---

## 2. Feature Flag Use Cases

We utilize feature flags to gate incomplete or high-risk features safely in production:

- **AI Concierge**: Gated for VIP buyers initially, or a 10% traffic rollout.
- **Visual Search**: Kill switch in case the Python/pgvector service experiences high latency.
- **International Checkout**: Staggered rollout by country (e.g., enable USA and UK, keep UAE disabled).
- **New Payment Providers**: Enabling an alternative gateway seamlessly.
- **Festival Campaigns**: Instant enablement of Diwali/Eid UI themes without a deployment.

---

## 3. Flag Types & Targeting

The internal engine supports:
- **Boolean Flags**: Simple ON/OFF (e.g., `maintenance_mode`).
- **Percentage Rollouts**: E.g., `ai_concierge_enabled: 20%`.
- **Targeting Rules**:
  - **By Country ISO**: Enable only if `session.country === 'US'`.
  - **By User Role**: Enable only if `user.role === 'SUPER_ADMIN'`.
  - **By Email Domain**: Enable for internal testing (`@saree-elegance.com`).

---

## 4. Governance & Lifecycle

- **Naming Conventions**: Flags must be descriptive and lowercase (`enable_international_shipping`, `beta_visual_search`).
- **Ownership**: Every flag must have a documented GitHub PR owner.
- **Expiration & Cleanup Rules**: 
  - Temporary release flags MUST be removed from the codebase within **30 days** of full 100% rollout to prevent technical debt.
  - Permanent operational flags (e.g., `payment_gateway_failover`) do not expire.
- **Audit Logging**: Toggling a flag via the Admin portal records an entry in the `SecurityAuditLog`.
- **Failure Defaults**: If the Redis flag cache is unreachable, flags gracefully degrade to their safe `false` fallback value defined in the codebase.

---

## 5. Implementation Strategy

- **Server-Side Enforcement**: API controllers evaluate flags via a utility (`const enabled = await featureFlags.isEnabled('ai_concierge', user)`).
- **Client-Side Presentation**: The initial API payload or a dedicated `/api/v1/config/flags` endpoint delivers active boolean flags to the React application, which conditionally renders UI components (`{flags.enableVisualSearch && <SearchByImageButton />}`).
