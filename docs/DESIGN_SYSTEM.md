# Enterprise Luxury Design System & Component Library Architecture ("Heirloom Ivory")

---

## 1. Executive Summary & Aesthetic Mandate
The visual identity of our luxury saree platform is governed by the **"Heirloom Ivory" Design System**—a meticulous, anti-slop aesthetic standard inspired by museum textile exhibitions, royal Indian palaces, and high-jewelry boutiques. Every component must evoke cultural heritage, spaciousness, and artisanal craftsmanship while maintaining WCAG 2.1 AA accessibility and responsive adaptability.

---

## 2. Design Tokens & Color Palette

**Status**: Proposed — Requires accessibility verification.

### 2.1 Color Matrix (`index.css` mapping)
Our color system rejects harsh pure blacks (`#000000`), sterile medical whites (`#FFFFFF`), and AI-generated neon gradients. We employ warm neutrals and rich cultural gemstone accents.

*(Note: The following names are proposed mappings for the hex values currently present in `src/index.css`. Contrast ratios require verification.)*

| Token Name (Proposed) | Hex Value (Existing) | Color Role & Usage Context | Contrast Ratio (vs. Ivory) |
| :--- | :---: | :--- | :---: |
| `heirloom-ivory` | `#FAF7F2` | Primary App & Page Background Canvas | Base Canvas |
| `palace-sand` | `#F3EFE6` | Secondary Card Containers, Track Backgrounds | Requires measurement |
| `zari-gold` | `#C28E46` | Primary Interactive Elements, Accents | Requires measurement |
| `zari-gold-bright` | `#D4AF37` | Gradients, Highlights | Requires measurement |
| `zari-gold-dark` | `#B37D35` | Gradients, Hover States | Requires measurement |
| `peacock-indigo` / `charcoal-brown` | `#2C221E` | Primary Heading and Body Typography | Requires measurement |

---

## 3. Typography & Hierarchy (Mathematical Scaling)

**Status**: Existing (Fonts) / Proposed (Scale) — Requires RTL testing and mixed-script validation.

### 3.1 Typeface Selection & Font Loading
- **Primary Display Typeface**: `Cormorant Garamond` (Serif). Used strictly for H1–H3 headings, hero banners, and cultural storytelling quotes. (Verified existing).
- **Primary Body Typeface**: `Plus Jakarta Sans` (Sans-serif). Used for all UI controls, body paragraphs, price digits, and navigation links. (Verified existing).

**Font Fallback & Script Support:**
- We must define script-aware font fallback requirements for Indic scripts (Devanagari, Bengali, Gujarati, Gurmukhi, Tamil, Telugu, Kannada, Malayalam) and Urdu/Arabic.
- Do not assume one Latin font supports all Indian scripts.
- **Font Loading Strategy**: Use `font-display: swap` to prevent layout shifts. Locale-specific testing is required to ensure consistent line-heights across scripts.

### 3.2 Typography Type Scale (Proposed Major Third 1.25 Ratio)
```text
[Display H1] -> 48px / 1.15 line-height / Cormorant Garamond / Tracking -0.02em
[Heading H2] -> 36px / 1.25 line-height / Cormorant Garamond
[Heading H3] -> 24px / 1.35 line-height / Cormorant Garamond
[Body Lead]  -> 18px / 1.65 line-height / Plus Jakarta Sans
[Body Basic] -> 16px / 1.60 line-height / Plus Jakarta Sans (Minimum Body Size)
[Small Tag]  -> 13px / 1.40 line-height / Plus Jakarta Sans / Uppercase / Tracking +0.08em
```

---

## 4. Layout, Spacing & Container Geometry

**Status**: Proposed — Requires design approval.

### 4.1 Spacing Rhythm & Grid Constraints
- **8px Base Grid**: All margins, paddings, and heights align to an 8px grid (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`).
- **Maximum Container Width**: Storefront layouts are constrained to `max-w-7xl` (`1280px`) with fluid outer padding (`px-4 sm:px-6 lg:px-8`) to prevent content from stretching across ultra-wide desktop monitors.
- **Padding Math Rule**: Container outer padding always equals or exceeds the inner gap between child items.

### 4.2 Corner Radii & Nesting Formula
- **Default Card Corner Radius**: `rounded-lg` (`8px`) or `rounded-xl` (`12px`).
- **Interactive Pill Buttons**: `rounded-full` (`24px`).
- **Nested Border Rule**: When an image or inner card sits inside a rounded container, the inner radius follows:
  $$\text{Inner Radius} = \text{Outer Radius} - \text{Padding}$$

---

## 5. UI Component Library Architecture (`/src/components/ui/`)

**Status**: Partially Existing (`lucide-react`) / Proposed (Primitives & Headless UI).

### 5.1 Component Design Principles & Dependencies
- **Iconography (`lucide-react`)**: Only 1.5px stroke width Lucide icons are permitted. No decorative clip-art or mismatched SVG styles. (Verified existing).
- **Headless UI Strategy**: Radix UI is **Not Found** in the current repository. 
  - **Option A (Deferred)**: Continue with existing custom accessible components for simplicity.
  - **Option B (Proposed)**: Adopt `@radix-ui/react-*` incrementally for complex primitives (modals, dropdowns) to guarantee ARIA keyboard navigation, focus trapping, and screen reader announcements. This requires business approval to add dependencies.

### 5.2 Money Display Contract
No frontend component should perform financial calculations or assume a base currency like INR. Instead, use a backend-authoritative generic contract:

```ts
interface Money {
  amountMinor: number; // e.g., 2450000 for 24,500.00
  currency: string;    // e.g., 'INR', 'USD'
}
```
- **Rules**: No frontend financial authority, no hardcoded exchange rates, no floating-point financial calculations. Formatting uses `Intl.NumberFormat` only for display purposes. Checkout totals come from the backend.

### 5.3 Certification Components (e.g., Silk Mark)
Do not imply that a Silk Mark or GI certificate is valid merely because a number is present. The verified certification model includes:
- Verification status
- Issuer and Certificate ID
- Verification URL and Verified-at timestamp
- Expiration (if applicable)
- Backend source of truth
- Unverified-state UI fallback

### 5.4 Core Reusable Primitives (Proposed)
1. `<LuxuryButton />`: Implements subtle hover elevation and active press scaling (`active:scale-[0.98]`).
2. `<MoneyDisplay money={Money} />`: Implements the aforementioned `Money` contract.
3. `<CertificationBadge cert={CertificationRecord} />`: Renders an interactive tooltip displaying verifiable GI tag/Silk Mark certification.
4. `<ProductCardSkeleton />`: Implements an `aspect-[3/4]` shimmer placeholder to ensure zero CLS during network loads.

---

## 6. Accessibility (A11y) & Interaction Standards

**Status**: Accepted — Requires accessibility verification and testing.

- **Focus & Keyboard Navigation**: Ensure explicit `:focus-visible` styles on all interactive elements. Keyboard interaction patterns must allow full navigation without a mouse. Modal focus restoration is required.
- **Motion**: Respect `prefers-reduced-motion` for all transitions and layout animations.
- **Touch Targets**: Minimum touch targets on mobile devices must be `44px` by `44px`.
- **Screen Readers**: Ensure screen-reader labels for icon-only buttons (`aria-label`). Error announcements must use `aria-live` regions. Form instructions must be explicitly tied to inputs via `aria-describedby`.
- **Text & Zoom**: Support text expansion and high zoom (up to 400%) without breaking layout geometry or truncating labels.
- **Localization**: UI must undergo RTL (Right-to-Left) testing and support mixed-script and bidirectional text safety safely.
