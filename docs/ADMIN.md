# Enterprise Admin Portal & Merchandising Suite Architecture — Luxury Saree Platform

---

## 1. Executive Summary & Security Architecture
The Enterprise Admin Portal (`/admin/*`) is a secure, role-restricted internal command center empowering merchandisers, inventory managers, customer support agents, and super administrators to manage the saree catalog, track artisan weaving inventories, process multi-currency orders, and configure localization rules without engineering intervention.

### 1.1 Security & Routing Guards
- Every administrative view is guarded by React Router auth wrappers verifying that the active JWT access token contains an authorized administrative role (`SUPER_ADMIN`, `MERCHANDISER`, `INVENTORY_MANAGER`, `SUPPORT_AGENT`).
- Every admin backend API endpoint (`/api/v1/admin/*`) enforces role validation and logs the actor UUID, action, and IP address to the immutable PostgreSQL `SecurityAuditLog` table.

---

## 2. RBAC Permissions Matrix

| Admin Module / Operation | Super Admin | Merchandiser | Inventory Mgr | Customer Support |
| :--- | :---: | :---: | :---: | :---: |
| **Catalog & Saree CRUD** | ✅ Full | ✅ Full | ❌ Read-Only | ❌ Read-Only |
| **Stock & Warehouse Adjustments**| ✅ Full | ❌ Read-Only | ✅ Full | ❌ Read-Only |
| **Order Management System (OMS)**| ✅ Full | ✅ Read-Only | ✅ Full | ✅ Full |
| **Order Refunds & Cancellations**| ✅ Full | ❌ No | ❌ No | ✅ Up to ₹15,000 |
| **Localization & Currency Control**| ✅ Full | ✅ Full | ❌ Read-Only | ❌ Read-Only |
| **Exchange Rate Manual Overrides** | ✅ Full | ✅ Full | ❌ No | ❌ No |
| **Staff Role Assignment & Security**| ✅ Full | ❌ No | ❌ No | ❌ No |

---

## 3. Core Administrative Modules & UX Workflow

```
+---------------------------------------------------------------------------------+
|                       ENTERPRISE ADMIN PORTAL (/admin/*)                        |
|                                                                                 |
|  +--------------------+    +-----------------------+    +--------------------+  |
|  | Catalog & Inventory|    |   Order Mgt System    |    |  Localization &    |  |
|  |     Management     |    |         (OMS)         |    |  Currency Control  |  |
|  +---------+----------+    +-----------+-----------+    +---------+----------+  |
|            |                           |                          |             |
|            +---------------------------+--------------------------+             |
|                                        |                                        |
|                                        v                                        |
|  +---------------------------------------------------------------------------+  |
|  |                  Express Admin APIs (/api/v1/admin/*)                     |  |
|  |         (Zod Validated • RBAC Enforced • Audit Trail Logged)              |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

### 3.1 Executive Analytics Dashboard (`/admin/dashboard`)
- **Key Metrics**: Real-time Gross Merchandise Value (GMV in INR/USD), AOV, Conversion Rate, Top Weaving Traditions by sales volume (Banarasi vs. Kanchipuram vs. Chanderi), and Active Carts.
- **Visualizations**: D3 / Recharts time-series charts illustrating seasonal festive revenue spikes and international vs. domestic sales ratios.

### 3.2 Catalog & Saree Merchandising Suite (`/admin/catalog`)
- **Saree Attribute Editor**: Specialized UI forms for saree attributes (Weave Technique, Zari Purity Grade, Silk Mark License No., Reed/Pick count, Blouse Piece inclusion, Fall/Pico status).
- **Artisan & Cluster Management**: CRUD interfaces to manage weaving cluster profiles (`Artisan` and `Region` entities), attaching biographical videos and GI tag certificates.
- **Bulk Import / Export**: CSV and Excel upload engine powered by BullMQ background workers to update thousands of SKU prices or stock quantities without browser timeouts.

### 3.3 Warehouse & Inventory Management (`/admin/inventory`)
- **1-of-1 Unique Saree Tracking**: Special visual tags indicating one-of-a-kind sarees (`isOneOfAKind: true`). Once checked out, the inventory manager can trigger automated archival or custom weaving re-order tickets.
- **Stock Audit Ledger**: Complete audit trail of every stock addition, reservation, and return restock (`InventoryTransaction`).

### 3.4 Order Management System (OMS) (`/admin/orders`)
- **Lifecycle Tracking**: Workflow status transitions: `PENDING` -> `PAID` -> `WEAVING_BLOUSE` (if custom stitching requested) -> `PACKED` -> `SHIPPED` -> `DELIVERED` (or `CANCELLED` / `RETURNED`).
- **Fulfillment & Invoicing**: Automated tax invoice generation in PDF format adhering to GST rules (India) or VAT/DDP compliance (international orders).

### 3.5 Localization & Currency Control Center (`/admin/localization`)
- **Country & Language Switcher Control**: Toggle active countries, assign default languages, and set regional GST/VAT tax percentages.
- **Live & Manual Exchange Rate Override**: View OpenExchangeRates automated sync logs or lock an override exchange rate during promotional campaigns.
- **Translation Key Editor**: Live JSON namespace editor (`common`, `product`, `checkout`) allowing merchandisers to edit wording across Hindi, Urdu, Tamil, Telugu, and English.

---

## 4. Security Audit Trail & Governance (`SecurityAuditLog`)
All administrative mutations are recorded in a tamper-proof PostgreSQL audit log table:
```prisma
model SecurityAuditLog {
  id          String   @id @default(uuid())
  actorId     String   // Admin User UUID
  action      String   // e.g., "OVERRIDE_EXCHANGE_RATE", "REFUND_ORDER"
  resourceId  String   // Target Entity UUID
  oldPayload  Json?    // State before mutation
  newPayload  Json?    // State after mutation
  ipAddress   String
  createdAt   DateTime @default(now())
}
```
