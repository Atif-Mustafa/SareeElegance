const fs = require('fs');
let payCtrl = fs.readFileSync('server/src/modules/payment/payment.controller.ts', 'utf-8');
payCtrl = payCtrl.replace(/await paymentService\.createPaymentAttempt\(req\.body\)/, "await paymentService.createPaymentAttempt(req.body.checkoutSessionId, BigInt(req.body.amountMinor || 0), req.body.currency || 'USD', req.body.provider || 'STRIPE')");
payCtrl = payCtrl.replace(/await paymentService\.verifyPayment\(id, token, amountMinor\)/, "await paymentService.verifyPayment(id)");
payCtrl = payCtrl.replace(/result\.id/g, "result.paymentAttemptId");
payCtrl = payCtrl.replace(/await paymentService\.handleWebhook\(req\)/, "await paymentService.handleWebhook('stripe', req.body)");
fs.writeFileSync('server/src/modules/payment/payment.controller.ts', payCtrl);

let retSrv = fs.readFileSync('server/src/modules/returns/returns.service.ts', 'utf-8');
retSrv = retSrv.replace(/throw ApiError\.notFound\(\)/g, "throw ApiError.notFound('Return request not found')");
fs.writeFileSync('server/src/modules/returns/returns.service.ts', retSrv);

let chkSrv = fs.readFileSync('server/src/modules/checkout/checkout.service.ts', 'utf-8');
chkSrv = chkSrv.replace(/status: 'ACTIVE'/g, "status: 'ACTIVE' as const");
fs.writeFileSync('server/src/modules/checkout/checkout.service.ts', chkSrv);

let invSrv = fs.readFileSync('server/src/modules/inventory/inventory.service.ts', 'utf-8');
invSrv = invSrv.replace(/status: 'ACTIVE',/, "status: 'ACTIVE' as const,");
fs.writeFileSync('server/src/modules/inventory/inventory.service.ts', invSrv);

let invTest1 = fs.readFileSync('server/tests/integration/inventory/inventory-concurrency.test.ts', 'utf-8');
invTest1 = invTest1.replace(/\.status/g, ".available ? 'ACTIVE' : 'FAILED'");
fs.writeFileSync('server/tests/integration/inventory/inventory-concurrency.test.ts', invTest1);

let invTest2 = fs.readFileSync('server/tests/unit/inventory/inventory.service.test.ts', 'utf-8');
invTest2 = invTest2.replace(/\.status/g, ".available ? 'ACTIVE' : 'FAILED'");
fs.writeFileSync('server/tests/unit/inventory/inventory.service.test.ts', invTest2);
