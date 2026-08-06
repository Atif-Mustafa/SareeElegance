# Enterprise Localization, Currency, RTL & Country System Architecture

This document outlines the architecture and technical implementation of our dynamic, backend-driven localization system (inspired by Shopify, Amazon, and Apple Store).

---

## 1. System Philosophy & Objectives

- **Zero Hardcoding**: Languages, currencies, exchange rates, and country rules are dynamically stored in PostgreSQL and served via cached Express REST APIs.
- **Lazy Loading & Namespace Chunking**: Powered by `i18next` + `i18next-http-backend` to ensure the frontend bundle remains lightweight by loading translation namespaces on demand.
- **Dynamic RTL Layout Engine**: Automated DOM direction switching (`ltr` ↔ `rtl`) with full layout and icon mirroring for Right-to-Left languages (e.g., Urdu, Arabic).
- **Locale-Aware Financial Precision**: Strict currency conversion and price presentation using native browser `Intl.NumberFormat` backed by BullMQ worker-synchronized exchange rates.

---

## 2. Dynamic Language Management (`i18next`)

### 2.1 Architecture & Workflow
1. **Frontend Bootstrapping**: On startup, React initializes `i18next` with `i18next-http-backend` and `i18next-browser-languagedetector`.
2. **Namespace Structure**: Translations are split into logical namespaces (`common`, `product`, `checkout`, `account`) to minimize data transfer.
3. **Fallback Strategy**:
   - If a translation key is missing in a regional locale (e.g., `te`), `i18next` automatically falls back to Hindi (`hi`) or English (`en`).
   - Missing keys are logged to the backend observability pipeline.

### 2.2 Preference Synchronization Hierarchy
When determining the active language and currency, the system evaluates preferences in strict priority order:
```
1. Authenticated User Profile (PostgreSQL Database via JWT session)
2. Persisted Cookie (`USER_LOCALE`, `USER_CURRENCY` - 365 days TTL)
3. Client LocalStorage (`app_locale`, `app_currency`)
4. Browser Navigator Language Detection (`navigator.language`)
5. System Default Configuration (`en` / `INR` / `IN`)
```
*Note*: When a guest user logs in, their guest session preferences are automatically merged into their user profile.

---

## 3. Right-to-Left (RTL) Support Engine

### 3.1 DOM Direction Management
When an RTL language (e.g., Urdu `ur`) is activated:
- The system updates `document.documentElement.dir = 'rtl'` and `document.documentElement.lang = 'ur'`.
- Tailwind CSS logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) ensure padding, margins, and borders mirror automatically.
- Direction-sensitive icons (e.g., chevrons, arrows) apply `rtl:rotate-180` for visual consistency.

---

## 4. Dynamic Currency & Pricing Engine

### 4.1 Backend Exchange Rate Worker
- **BullMQ Worker (`exchangeRateWorker`)**: Runs a cron job every 6 hours (`0 */6 * * *`) to fetch live exchange rates from external exchange rate APIs.
- **Redis Cache Layer**: Stores exchange rates in `rates:latest` with a 3,600-second TTL to ensure zero-latency reads.
- **Historical Order Ledger**: When a customer completes checkout, the exact exchange rate and converted amount are immutably archived on the `Order` record for audit compliance.

### 4.2 Frontend Currency Presentation (`Intl.NumberFormat`)
- All prices across Product Listing Pages (PLP), Product Detail Pages (PDP), Shopping Cart, and Checkout use native `Intl.NumberFormat`.
- Indian Vedic numbering (`₹1,50,000.00`) is preserved for INR, while Western grouping (`$1,800.50` or `AED 6,600.00`) is automatically applied based on active currency selection.

---

## 5. Country Configuration & Regional Rules

Selecting a country in the store header switcher automatically configures:
- **Default Locale & Language**: Sets language to the country's default unless manually overridden.
- **Default Currency**: Switches prices to the national currency.
- **Tax Rules**: Dynamically applies regional tax calculation logic (e.g., 18% GST for India, VAT rules for Europe).
- **Warehouse Fulfillment**: Routes stock checks to regional inventory centers.
