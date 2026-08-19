import fs from 'fs';
const content = fs.readFileSync('docs/API_SPEC.md', 'utf-8');
const newEntry = `
## 3. Catalog Endpoints (Read-Only)

### 3.1 Get Active Products
- **Method / Path**: \`GET /api/v1/products\`
- **Description**: Returns a paginated list of active products in the catalog.
- **Parameters**: 
  - \`page\` (default 1)
  - \`limit\` (default 24)
  - \`category\`, \`fabric\`, \`weave\`, \`region\`, \`color\`, \`occasion\`, \`minPriceMinor\`, \`maxPriceMinor\`
  - \`sort\` (newest, price_asc, price_desc, name_asc)
- **Response**: Paginated list of \`CatalogProductSummary\` DTOs. BigInt prices are returned as strings.

### 3.2 Get Product Details
- **Method / Path**: \`GET /api/v1/products/:slug\`
- **Description**: Returns the full \`CatalogProductDetail\` DTO for a specific active product by its slug.
- **Response**: \`CatalogProductDetail\`. Returns 404 for DRAFT, ARCHIVED, or unknown products.

### 3.3 Get Active Categories
- **Method / Path**: \`GET /api/v1/categories\`
- **Description**: Returns all active categories.
- **Response**: List of \`CatalogCategoryDto\`.

`;
const updated = content.replace('## 3. Localization & Currency Endpoints', newEntry + '## 4. Localization & Currency Endpoints');
fs.writeFileSync('docs/API_SPEC.md', updated);
