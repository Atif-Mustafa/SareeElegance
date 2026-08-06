# Enterprise Relational Database Schema & Data Modeling Specification — Luxury Saree E-Commerce

---

## 1. Architectural Philosophy & Normalization Strategy
The database layer for our luxury heritage saree platform is built on **PostgreSQL 16+** using **Prisma ORM**. To support high-value inventory, unique one-of-a-kind sarees, multi-language localization, and multi-currency accounting, the schema adheres to **3rd Normal Form (3NF)** with strategic denormalization applied only for analytical performance (e.g., aggregated review ratings, inventory ledger summaries).

### 1.1 Universal Enterprise Audit & Soft Delete Governance
Every relational table across the system inherits a standard enterprise audit and lifecycle trait:
- `createdAt` (`DateTime @default(now())`): Immutable insertion timestamp.
- `updatedAt` (`DateTime @updatedAt`): Automatic Prisma mutation timestamp.
- `deletedAt` (`DateTime?`): Nullable timestamp supporting **Soft Delete** patterns. Destructive SQL `DELETE` operations are strictly prohibited on transactional and catalog tables to preserve historical accounting and forensic auditability.
- `version` (`Int @default(1)`): Optimistic concurrency control counter to prevent lost-update race conditions during concurrent inventory checkouts or merchandising edits.

---

## 2. Complete Normalized Entity Schema Matrix

```
                                  +-------------------+
                                  |     Category      |
                                  +---------+---------+
                                            |
                                            | 1:N
                                            v
+-------------------+             +-------------------+             +-------------------+
|     Artisan       |--- 1:N ---->|      Product      |<--- N:M ---->|    Collection     |
+-------------------+             +---------+---------+             +-------------------+
                                            |
         +----------------------------------+----------------------------------+
         | 1:N                              | 1:N                              | 1:N
         v                                  v                                  v
+-------------------+             +-------------------+             +-------------------+
|  ProductVariant   |             |   ProductImage    |             |   ProductVideo    |
+---------+---------+             +-------------------+             +-------------------+
          |
          | 1:N
          v
+-------------------+             +-------------------+             +-------------------+
|     Inventory     |<--- 1:N ----|     Warehouse     |             |    Review         |
+---------+---------+             +-------------------+             +-------------------+
          |
          | 1:N
          v
+-------------------+
|InventoryTransaction|
+-------------------+
```

---

## 3. Core Saree Catalog & Textile Attribute Entities

### 3.1 `Product`
- **Purpose**: Represents the master saree catalog entity containing universal editorial descriptions, SEO metadata, and cultural storytelling attributes.
- **Key Fields**: `id` (UUID), `skuPrefix`, `slug` (unique canonical URL), `title`, `subtitle`, `description`, `historyStory`, `categoryId`, `artisanId`, `regionId`, `isActive`, `isArchived`, audit fields.
- **Indexes**: `@@index([slug, isActive])`, `@@index([categoryId, isActive])`, `@@index([artisanId])`.

### 3.2 `ProductVariant`
- **Purpose**: Represents purchasable stock-keeping units (SKUs). While many luxury sarees are 1-of-1 unique handwoven pieces, variants handle blouse customization options (unstitched piece, custom-stitched, or contrast blouse), zari purity grades, or dye variations.
- **Key Fields**: `id` (UUID), `productId`, `sku` (unique), `barcode` (Silk Mark QR), `priceINR`, `priceUSD`, `weightGrams`, `isOneOfAKind`, `zariPurityGrade` (`REAL_SILVER_GOLD_PLATED`, `TESTED_ZARI`, `METALLIC`), `fallPicoStatus` (`INCLUDED`, `OPTIONAL`).
- **Relationships**: `Product` (`1:N`, Cascade delete), `Inventory` (`1:N`), `CartItem`, `OrderItem`.
- **Constraints & Indexes**: `@@unique([sku])`, `@@index([productId, isOneOfAKind])`.

### 3.3 `ProductImage` & `ProductVideo`
- **Purpose**: Manages high-resolution multi-angle photography (pallu zoom, zari macro, drape view, reverse weave neatness) and 4K loom weaving videos.
- **Key Fields (`ProductImage`)**: `id`, `productId`, `cdnUrl`, `altText`, `sortOrder`, `isHero`, `imageType` (`PALLU`, `BORDER`, `BODY`, `BLOUSE`, `MACRO_ZARI`).
- **Key Fields (`ProductVideo`)**: `id`, `productId`, `streamUrl`, `thumbnailUrl`, `durationSec`, `caption`.

### 3.4 `ProductAttribute`
- **Purpose**: Normalized key-value attribute table for technical textile metadata (e.g., Reed Count: 2400, Pick Count: 80, Warp: Mulberry Silk, Weft: Mulberry + Zari).
- **Key Fields**: `id`, `productId`, `attributeKey`, `attributeValue`, `displayOrder`.

### 3.5 `Category` & `Collection`
- **Purpose (`Category`)**: Hierarchical tree taxonomy (Sarees > Banarasi Silk > Katan Kadwa). Supports self-referencing parent-child relationships (`parentId`).
- **Purpose (`Collection`)**: Curated thematic or festive merchandising capsules (e.g., *"The Festive Heritage Capsule 2026"*, *"Bridal Red Brocades"*). Uses an explicit N:M join table `ProductCollection`.

---

## 4. Textile Craftsmanship & Heritage Taxonomy Entities

### 4.1 `Fabric`, `Weave`, `Technique`, & `Occasion`
- **`Fabric`**: Standardized silk/cotton base materials (`Katan Silk`, `Tussar`, `Muga`, `Organza`, `Chanderi`).
- **`Weave`**: Weaving loom classification (`Kadwa`, `Kadhuan`, `Jamdani`, `Tanchoi`, `Kutni`).
- **`Technique`**: Decorative surface technique (`Meenakari Enamel`, `Zari Brocade`, `Ikat Dyeing`, `Bandhani`).
- **`Occasion`**: Occasion tagging (`Bridal`, `Wedding Guest`, `Temple Ceremony`, `Festive Evening`).

### 4.2 `ColorFamily`, `Border`, `Pallu`, `Blouse`, `Pattern`, & `Motif`
- **`ColorFamily`**: Standardized hue grouping (`Crimson Red`, `Emerald Green`, `Royal Peacock Blue`, `Mustard Yellow`).
- **`Border`**: Border taxonomy (`Korvai Interlocked`, `Ganga-Jamuna`, `Zari Tissue`, `No Border`).
- **`Pallu`**: Pallu style (`Heavy Zari Brocade`, `Shikargah Hunting Scene`, `Peacock Jaal`).
- **`Blouse`**: Blouse specification (`Matching Unstitched`, `Contrast Brocade`, `No Blouse`).
- **`Pattern` & `Motif`**: Weave patterns (`Kalka/Paisley`, `Floral Buti`, `Shikargah`, `Ashrafil/Coin`).

### 4.3 `Artisan`, `Region`, & `CareInstruction`
- **`Artisan`**: Profile of the master weaver or cooperative cluster (`name`, `bio`, `clusterName`, `experienceYears`, `portraitUrl`, `silkMarkLicenseNo`).
- **`Region`**: Geographical Indication (GI) heritage cluster (`name`: "Varanasi, Uttar Pradesh", `giTagNumber`, `historyText`).
- **`CareInstruction`**: Standardized silk care instructions (`dryCleanOnly: true`, `ironTemp: LOW_STEAM`, `storageAdvice: "Store in breathable unbleached muslin cloth"`).

---

## 5. Warehouse, Inventory & Audit Ledger Entities

### 5.1 `Warehouse`
- **Purpose**: Physical silk vaults and fulfillment centers (`name`: "Varanasi Heritage Vault", `addressId`, `isActive`).

### 5.2 `Inventory`
- **Purpose**: Tracks SKU stock per warehouse.
- **Key Fields**: `id`, `warehouseId`, `productVariantId`, `quantityOnHand`, `quantityReserved`, `quantityAvailable` (Computed/Indexed), `binLocation`, `reorderThreshold`.
- **Constraints**: `@@unique([warehouseId, productVariantId])`, `@@index([quantityAvailable])`.

### 5.3 `InventoryTransaction`
- **Purpose**: Immutable append-only inventory accounting ledger recording every stock movement.
- **Key Fields**: `id`, `inventoryId`, `transactionType` (`WEAVING_INBOUND`, `ORDER_RESERVED`, `ORDER_SHIPPED`, `RETURN_RESTOCK`, `AUDIT_ADJUSTMENT`), `quantityChange`, `referenceId` (Order UUID or Purchase Order ID), `performedByActorId`.

---

## 6. Promotional, Tax & Shipping Governance Entities

### 6.1 `Coupon` & `TaxRule`
- **`Coupon`**: Promotional discounts (`code`: "HEIRLOOM10", `discountType`: `PERCENTAGE` | `FIXED_INR`, `discountValue`, `minOrderAmount`, `maxUses`, `usedCount`, `startDate`, `endDate`).
- **`TaxRule`**: Tax compliance matrix (`countryCode`: "IN", `stateCode`: "UP", `taxType`: "GST_SILK", `percentage`: 12.00, `minPriceThreshold`: 1000).

### 6.2 `ShippingRule` & `Address`
- **`ShippingRule`**: International logistics pricing (`countryCode`, `courierPartner`: "FEDEX_DDP", `baseCostINR`, `freeShippingThresholdINR`, `estimatedDaysMin`, `estimatedDaysMax`).
- **`Address`**: Universal customer/warehouse addressbook (`street1`, `street2`, `city`, `stateProvince`, `postalCode`, `countryCode`, `isDefaultShipping`, `isDefaultBilling`).

---

## 7. Customer Interaction, Social Proof & Checkout Entities

### 7.1 `Review` & `Rating`
- **`Review`**: Customer review with purchase verification (`userId`, `productId`, `title`, `commentText`, `isVerifiedPurchase`, `zariAuthenticityRating`, `fabricFeelRating`).
- **`Rating`**: Denormalized aggregate rating summary per product (`productId`, `averageScore`, `totalReviews`, `star5Count` to `star1Count`) to prevent expensive table scans on PLP rendering.

### 7.2 `Wishlist`, `Cart`, & `Order`
- **`Wishlist`**: Customer wishlist (`userId`, `productVariantId`, `addedAt`).
- **`Cart` & `CartItem`**: Persistent active shopping cart supporting customized blouse measurements and pico finishing add-ons.
- **`Order` & `OrderItem`**: Immutable order ledger (`orderNumber`: "SR-2026-89012", `userId`, `totalINR`, `totalUSD`, `status`: `PENDING` | `PAID` | `WEAVING_BLOUSE` | `SHIPPED` | `DELIVERED`, `shippingAddressId`, `billingAddressId`).
- **`OrderItem`**: Snapshot of item price and textile specification at the moment of checkout.

### 7.3 `Payment`, `Shipment`, `Return`, & `Notification`
- **`Payment`**: Payment transaction record (`orderId`, `gateway`: `STRIPE` | `RAZORPAY`, `transactionId`, `amount`, `currency`, `status`: `AUTHORIZED` | `CAPTURED` | `REFUNDED`).
- **`Shipment`**: Air waybill tracking (`orderId`, `courier`: "FedEx", `trackingNumber`, `shippedAt`, `estimatedDelivery`).
- **`Return`**: Concierge return and video-inspection workflow (`orderId`, `orderItemId`, `reasonCode`, `status`, `refundAmount`).
- **`Notification`**: Customer & system notification inbox (`userId`, `type`: `ORDER_SHIPPED` | `SILK_CARE_REMINDER` | `BACK_IN_STOCK`, `title`, `body`, `isRead`).

---

## 8. Indexing, Cascade Rules & Concurrency Governance
- **Cascade Rules**:
  - `Product` -> `ProductVariant` / `ProductImage` / `ProductAttribute` : `onDelete: Cascade`.
  - `Order` -> `OrderItem` / `Payment` / `Shipment` : `onDelete: Restrict` (Orders can never be hard-deleted).
- **Concurrency**: High-demand 1-of-1 sarees utilize database row-level locking (`SELECT ... FOR UPDATE` via Prisma `$transaction`) during cart reservation to prevent overselling.
