import fs from 'fs';

let content = fs.readFileSync('docs/ARCHITECTURE.md', 'utf-8');
content = content.replace(
  /1\. \*\*Catalog & Merchandising Context\*\*\n.*?\n.*?\n.*?\n/s,
  `1. **Catalog & Merchandising Context**
   - **Aggregate Root**: \`Product\` (Saree SKU).
   - **Entities & Value Objects**: \`SareeDetails\`, \`ProductMedia\`, \`ProductColor\`, \`ProductOccasion\`, \`Category\`.
   - **Responsibility**: Curating saree storytelling, weaving specifications, regional cluster profiles, and pricing tiers. Catalog is strictly decoupled from inventory.
`
);

fs.writeFileSync('docs/ARCHITECTURE.md', content);
