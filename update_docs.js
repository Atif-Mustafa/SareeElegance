import fs from 'fs';

let dbDocs = fs.readFileSync('docs/DATABASE.md', 'utf-8');
dbDocs = dbDocs.replace(
  /### 3.1 `Product`\n- \*\*Purpose\*\*: Represents the master saree catalog entity.*/,
  `### 3.1 \`Product\`
- **Purpose**: Represents the master saree catalog entity containing universal editorial descriptions, SEO metadata, canonical pricing, and cultural storytelling attributes.
- **Key Fields**: \`id\` (UUID), \`sku\` (unique), \`slug\` (unique canonical URL), \`name\`, \`shortDescription\`, \`longDescription\`, \`priceMinor\` (BIGINT), \`currency\`, \`categoryId\`, \`status\`, audit fields.
- **Indexes**: \`@@index([status])\`, \`@@index([categoryId])\`, \`@@index([createdAt])\`.`
);
dbDocs = dbDocs.replace(
  /### 3.2 `ProductVariant`[\s\S]*?### 3.3/,
  `### 3.2 \`SareeDetails\` (One-to-One with Product)
- **Purpose**: Represents the ethnic/saree-specific attributes isolated from the core Product. Keeps Product generic enough for potential future categories.
- **Key Fields**: \`id\` (UUID), \`productId\` (unique), \`fabric\`, \`weave\`, \`zariType\`, \`motif\`, \`region\`, \`artisanName\`, \`certificateType\`, \`certificateNumber\`, \`length\`, \`width\`, \`blousePiece\`, \`washCare\`.
- **Indexes**: \`@@index([fabric])\`, \`@@index([weave])\`.

### 3.3`
);
fs.writeFileSync('docs/DATABASE.md', dbDocs);
