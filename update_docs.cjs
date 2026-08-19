const fs = require('fs');

const changelog = `
## [Unreleased]
### Changed
- **Catalog Frontend Hardening**: The frontend catalog integration (PLP and PDP) is now strictly API-driven. Runtime mocks have been completely removed from storefront flows.
- **Race Safety**: Added \`ignore\` abort patterns to React \`useEffect\` hooks in PLP, PDP, and HomePage to prevent state updates on unmounted components and race conditions from rapidly changing routes or filters.
- **Money Handling**: Upgraded legacy \`Product\` type with \`priceMinor\` and \`currency\` fields. Stop-gap \`priceINR\` is retained as a view-model bridge but deprecated for any calculation.
- **Inventory Semantics**: Removed fabricated \`inStock\` and \`stockCount\` data from the DTO mapper. The frontend now gracefully omits or handles missing authoritative inventory data without fabricating assumptions.
- **Vite Proxy**: Documented that the Vite proxy for \`/api\` is for development only, expecting a same-origin production deployment.
`;

if (fs.existsSync('docs/CHANGELOG.md')) {
  let cl = fs.readFileSync('docs/CHANGELOG.md', 'utf-8');
  cl = cl.replace('## [Unreleased]', changelog);
  fs.writeFileSync('docs/CHANGELOG.md', cl);
} else {
  if (!fs.existsSync('docs')) fs.mkdirSync('docs');
  fs.writeFileSync('docs/CHANGELOG.md', changelog);
}

const architectureAddition = `
## Frontend Data Fetching (Catalog)
The storefront catalog reads strictly from the backend APIs (\`/api/v1/products\`, \`/api/v1/categories\`) using native \`fetch\` encapsulated in \`catalogApi\`.
- **API-Driven**: No mock data is used for runtime storefront listing or detail pages.
- **Production API Routing Expectation**: The Vite proxy is development-only. In production, the application expects a same-origin reverse proxy (e.g., Nginx) that routes \`/api/*\` to the Node.js backend and all other requests to the static frontend bundle.
- **Money Handling Boundary**: The API serves exact money as a string (minor units). The frontend mapper preserves this as \`priceMinor\` and \`currency\`.
- **Zustand Scope**: Store state is restricted to client interactions (cart, UI toggles). Catalog data is fetched dynamically.
`;

if (fs.existsSync('docs/ARCHITECTURE.md')) {
  let arch = fs.readFileSync('docs/ARCHITECTURE.md', 'utf-8');
  arch += architectureAddition;
  fs.writeFileSync('docs/ARCHITECTURE.md', arch);
} else {
  fs.writeFileSync('docs/ARCHITECTURE.md', architectureAddition);
}
