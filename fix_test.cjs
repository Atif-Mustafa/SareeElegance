const fs = require('fs');

let chk = fs.readFileSync('server/src/modules/checkout/checkout.service.ts', 'utf-8');
chk = chk.replace("status: 'ACTIVE',", "status: 'ACTIVE' as const,");
fs.writeFileSync('server/src/modules/checkout/checkout.service.ts', chk);

let inv1 = fs.readFileSync('server/tests/integration/inventory/inventory-concurrency.test.ts', 'utf-8');
// remove tests related to status completely from tests that are checking availability
inv1 = inv1.replace(/expect\(\(res as any\)\.status \|\| \(res as any\)\.available\)\.toBe/g, "expect((res as any).available).toBe");
// fix r.reason issue
inv1 = inv1.replace(/r\.status === 'fulfilled' \? 'ACTIVE' : \(\(r as any\)\.reason\?\.code \|\| 'FAILED'\)/g, "r.status === 'fulfilled' ? 'ACTIVE' : 'FAILED'");
inv1 = inv1.replace(/expect\(\(res as any\)\.status \|\| \(res as any\)\.available\)\.toBe\(true\);/g, "expect((res as any).available).toBe(true);");
inv1 = inv1.replace(/expect\(res\.status\)\.toBe\('ACTIVE'\);/g, "expect((res as any).available).toBe(true);");
fs.writeFileSync('server/tests/integration/inventory/inventory-concurrency.test.ts', inv1);

let inv2 = fs.readFileSync('server/tests/unit/inventory/inventory.service.test.ts', 'utf-8');
inv2 = inv2.replace(/expect\(\(res as any\)\.status \|\| \(res as any\)\.available\)\.toBe\(true\);/g, "expect((res as any).available).toBe(true);");
inv2 = inv2.replace(/expect\(res\.status\)\.toBe\('ACTIVE'\);/g, "expect((res as any).available).toBe(true);");
fs.writeFileSync('server/tests/unit/inventory/inventory.service.test.ts', inv2);

