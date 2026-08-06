# Enterprise Media Pipeline Architecture — Luxury Saree Photography & Video

---

## 1. Executive Summary & Visual Quality Mandate
In luxury saree e-commerce, high-fidelity visual presentation is the single most critical driver of buyer confidence and conversion. Customers inspecting a ₹1,80,000 / $2,200 USD Banarasi Katan silk saree require crystal-clear visual confirmation of the *Zari* (gold/silver thread) purity, hand-woven *Kadwa* embossing, and pallu drape fluidity.

Our **Enterprise Media Pipeline** achieves museum-grade visual fidelity while strictly enforcing a **Largest Contentful Paint (LCP) < 1.8s** SLA across 4G mobile devices.

---

## 2. End-to-End Media Delivery Architecture

```
+---------------------------------------------------------------------------------+
|                        ENTERPRISE SAREE MEDIA PIPELINE                          |
|                                                                                 |
|  [Admin Upload (TIFF/PNG / 4K Video)] -> Pre-Signed S3 Upload URL               |
|       |                                                                         |
|       v  (Automated Ingestion & Malware Scan)                                   |
|  [Media Processing Engine (AWS MediaConvert / Cloudflare Images / Sharp)]       |
|       |                                                                         |
|       +---> [AVIF Engine]       -> Safari 16+, Chrome (40% smaller than WebP)   |
|       +---> [WebP Engine]       -> Evergreen Mobile / Standard Fallback         |
|       +---> [Macro Zoom Tiles]  -> 2048x2048 pyramid tiles for Zari thread zoom |
|       +---> [Video Transcode]   -> HLS/DASH streaming for drape movement        |
|       +---> [Shimmer Skeleton]  -> Base64 CSS blur-hash generated at ingest     |
|       |                                                                         |
|       v                                                                         |
|  [Cloudflare Edge CDN (Global Anycast)] -> Cache-Control: max-age=31536000      |
+---------------------------------------------------------------------------------+
```

---

## 3. Upload Security & Pre-Processing

- **Secure Uploads**: The frontend never uploads directly to the backend. The backend generates a **pre-signed upload URL** (e.g., AWS S3 / Cloudflare R2) valid for 15 minutes.
- **Validation & Moderation**: All uploads are strictly validated for MIME type (`image/png`, `image/tiff`, `video/mp4`). A background worker scans for malware before processing.
- **EXIF Stripping**: All EXIF metadata (location, device info) is automatically stripped to preserve photographer privacy and reduce file size.
- **Watermarking**: Automated subtle, localized watermarks (e.g., the brand logo at 15% opacity) are applied to high-resolution assets to deter unauthorized resale harvesting.

---

## 4. Image Sizing, Resolution Scaling & Responsive Attributes

### 4.1 Standard Saree Grid & PDP Resolution Breakpoints
Every saree image upload automatically generates a deterministic set of responsive variants. Specific crops include **Product Card Crop**, **PDP Hero**, **Border Detail**, **Pallu Detail**, and **Blouse Detail**.

| Breakpoint Tier | Width x Height | Target Viewport & Component | Format Priority | Target File Size (AVIF) |
| :--- | :--- | :--- | :--- | :--- |
| **Thumbnail (`sm`)** | `640w x 853h` | Mobile PLP Grid (`2-column`) | `AVIF -> WebP -> JPEG` | `< 35 KB` |
| **Catalog Grid (`md`)** | `1024w x 1365h` | Desktop PLP Grid (`4-column`) | `AVIF -> WebP -> JPEG` | `< 75 KB` |
| **PDP Main (`lg`)** | `1440w x 1920h` | Hero PDP Gallery Viewport | `AVIF -> WebP -> JPEG` | `< 160 KB` |
| **Macro Zoom (`xl`)** | `2048w x 2730h` | 6x Interactive Thread Magnifier | `AVIF -> WebP` | `< 380 KB` |

### 4.2 Standard HTML Component Implementation (`srcSet` & `sizes`)
All React product card components (`<SareeImage />`) must implement native browser responsive resolution switching:
```tsx
export function SareeImage({ saree, altText }: SareeImageProps) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden bg-heirloom-ivory/50">
      <img
        src={saree.images[0].urlWebP}
        srcSet={`
          ${saree.images[0].urlSm} 640w,
          ${saree.images[0].urlMd} 1024w,
          ${saree.images[0].urlLg} 1440w
        `}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        loading="lazy"
        decoding="async"
        alt={altText}
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
      />
    </div>
  );
}
```

---

## 5. Macro Zoom & Zari Inspection Canvas (Deep-Zoom Tiling)
- **Deep-Zoom Architecture**: When a customer hovers or touches the "Inspect Zari Brocade" button on the PDP, the canvas initializes a tiled viewport.
- **Tile Coordinate Engine**: Instead of downloading the full `2048x2730` image over mobile networks, the viewport only fetches `512x512` pixel tiles corresponding to the active zoom quadrant (`x, y, zoomLevel`), reducing bandwidth consumption by 82%.

---

## 6. Video Processing & 360° Media
- **Drape Videos**: 4K video uploads of models walking to showcase fabric drape are transcoded to **HLS/DASH adaptive bitrates**.
- **Poster Frames**: Auto-generated from the 1st second of the video to display before playback.
- **360° Imagery**: Optional support for 360-degree interactive spin viewers, utilizing a sequence of 36 images.

---

## 7. Caching, Headers & Storage Lifecycle
- **Content-Hashed URLs**: Every transcode variant generates an SHA-256 hash embedded in the filename (`/sarees/banarasi-katan-8901.a8f9d2.avif`).
- **CDN Edge Cache Policy**:
  ```http
  Cache-Control: public, max-age=31536000, immutable
  Vary: Accept
  ```
- **Storage Lifecycle**: Original raw TIFF files are moved to infrequent access storage (e.g., S3 Glacier) after 30 days. Archived product media is moved to deep archive after 2 years.
- **SEO Optimization**: Automated Image XML Sitemaps and localized `alt` tags driven by the CMS / AI auto-captioning.
