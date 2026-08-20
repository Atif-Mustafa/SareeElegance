const fs = require('fs');

let chkSrv = fs.readFileSync('server/src/modules/checkout/checkout.service.ts', 'utf-8');
chkSrv = chkSrv.replace(/status: 'ACTIVE' as 'ACTIVE'/g, "status: 'ACTIVE' as const");
fs.writeFileSync('server/src/modules/checkout/checkout.service.ts', chkSrv);

let invSrv = fs.readFileSync('server/src/modules/inventory/inventory.service.ts', 'utf-8');
invSrv = invSrv.replace(/status: 'ACTIVE' as 'ACTIVE'/g, "status: 'ACTIVE' as const");
fs.writeFileSync('server/src/modules/inventory/inventory.service.ts', invSrv);

let invTest1 = fs.readFileSync('server/tests/integration/inventory/inventory-concurrency.test.ts', 'utf-8');
invTest1 = invTest1.replace(/r\.status === 'fulfilled' \? 'ACTIVE' : 'FAILED'/g, "r.status === 'fulfilled' ? 'ACTIVE' : (r.reason?.code || 'FAILED')");
invTest1 = invTest1.replace(/expect\(res\.status\)\.toBe/g, "expect(res.available).toBe");
fs.writeFileSync('server/tests/integration/inventory/inventory-concurrency.test.ts', invTest1);

let invTest2 = fs.readFileSync('server/tests/unit/inventory/inventory.service.test.ts', 'utf-8');
invTest2 = invTest2.replace(/expect\(res\.status\)\.toBe/g, "expect(res.available).toBe");
fs.writeFileSync('server/tests/unit/inventory/inventory.service.test.ts', invTest2);
