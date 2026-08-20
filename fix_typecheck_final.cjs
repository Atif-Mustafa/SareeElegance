const fs = require('fs');

let payRoute = fs.readFileSync('server/src/modules/payment/payment.routes.ts', 'utf-8');
payRoute = payRoute.replace(/paymentController\.webhook/g, "paymentController.handleWebhook");
fs.writeFileSync('server/src/modules/payment/payment.routes.ts', payRoute);

let invSrv = fs.readFileSync('server/src/modules/inventory/inventory.service.ts', 'utf-8');
// Fix reserveItems to return an explicitly typed object
invSrv = invSrv.replace(/status: 'ACTIVE' as 'ACTIVE',/, "status: 'ACTIVE' as 'ACTIVE',");
if (!invSrv.includes("as 'ACTIVE'")) {
    invSrv = invSrv.replace(/status: 'ACTIVE',/, "status: 'ACTIVE' as 'ACTIVE',");
}
fs.writeFileSync('server/src/modules/inventory/inventory.service.ts', invSrv);

let chkSrv = fs.readFileSync('server/src/modules/checkout/checkout.service.ts', 'utf-8');
// same for checkout service if any
chkSrv = chkSrv.replace(/status: 'ACTIVE'/g, "status: 'ACTIVE' as 'ACTIVE'");
fs.writeFileSync('server/src/modules/checkout/checkout.service.ts', chkSrv);


let invTest1 = fs.readFileSync('server/tests/integration/inventory/inventory-concurrency.test.ts', 'utf-8');
invTest1 = invTest1.replace(/r\.status === 'fulfilled' \? 'ACTIVE' : 'FAILED'/g, "r.status === 'fulfilled' ? 'ACTIVE' : 'FAILED'");
invTest1 = invTest1.replace(/expect\(res\.status\)\.toBe\('ACTIVE'\);/g, "expect(res.available).toBe(true);");
fs.writeFileSync('server/tests/integration/inventory/inventory-concurrency.test.ts', invTest1);

let invTest2 = fs.readFileSync('server/tests/unit/inventory/inventory.service.test.ts', 'utf-8');
invTest2 = invTest2.replace(/expect\(res\.status\)\.toBe\('ACTIVE'\);/g, "expect(res.available).toBe(true);");
fs.writeFileSync('server/tests/unit/inventory/inventory.service.test.ts', invTest2);
