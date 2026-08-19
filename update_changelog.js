import fs from 'fs';
const content = fs.readFileSync('docs/CHANGELOG.md', 'utf-8');
const newEntry = `
## [Unreleased] - PR 5: Read-Only Catalog API Foundation

### Added
- Created shared, runtime-neutral Catalog DTOs (\`CatalogProductSummary\`, \`CatalogProductDetail\`, \`CatalogCategoryDto\`).
- Implemented \`CatalogMapper\` to strictly map Prisma objects to DTOs, ensuring BigInt fields (like \`priceMinor\`) are converted to string explicitly without precision loss.
- Added repository and service layers for reading catalog records.
- Implemented \`GET /api/v1/products\` exposing a paginated, filterable list of active products.
- Implemented \`GET /api/v1/products/:slug\` exposing full product detail for active products.
- Implemented \`GET /api/v1/categories\` exposing all active categories.
- Enforced strict lifecycle visibility: \`DRAFT\` and \`ARCHIVED\` products return 404 or are omitted.
- Validated public queries with Zod to prevent arbitrary filter/sort injection.
- Resolved deterministic primary media selection for products.

`;
const updated = content.replace('## [Unreleased] - PR 4: Catalog Domain Schema Foundation', newEntry + '## [Unreleased] - PR 4: Catalog Domain Schema Foundation');
fs.writeFileSync('docs/CHANGELOG.md', updated);
