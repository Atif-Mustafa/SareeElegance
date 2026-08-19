import fs from 'fs';

let content = fs.readFileSync('docs/DOMAIN_ARCHITECTURE.md', 'utf-8');
content = content.replace(
  /### 3.1 Catalog & Merchandising Context\n.*?\n- \*\*Entities\*\*: .*\n/s,
  `### 3.1 Catalog & Merchandising Context
- **Responsibilities**: Curating saree storytelling, weaving specifications, regional cluster profiles, and pricing tiers. Note: Catalog persistence is strictly separated from Inventory.
- **Aggregate Root**: \`Product\` (Saree SKU).
- **Entities**: \`SareeDetails\`, \`ProductMedia\`, \`ProductColor\`, \`ProductOccasion\`, \`Category\`.
`
);

fs.writeFileSync('docs/DOMAIN_ARCHITECTURE.md', content);
