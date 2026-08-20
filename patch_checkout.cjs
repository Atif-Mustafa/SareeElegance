const fs = require('fs');

let payCtrl = fs.readFileSync('server/src/modules/payment/payment.controller.ts', 'utf-8');
// Fix payment.controller again since I mistakenly modified it wrong.
payCtrl = payCtrl.replace(/await paymentService\.createPaymentAttempt\(req\.body\.checkoutSessionId, BigInt\(req\.body\.amountMinor \|\| 0\), req\.body\.currency \|\| 'USD', req\.body\.provider \|\| 'STRIPE'\)/, 
"await paymentService.createPaymentAttempt(req.body.checkoutSessionId, BigInt(req.body.amountMinor || 0), req.body.currency || 'USD', req.body.provider || 'STRIPE')");

payCtrl = `import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';

export const paymentController = {
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { checkoutSessionId, amountMinor, currency, provider } = req.body;
      const attempt = await paymentService.createPaymentAttempt(checkoutSessionId, BigInt(amountMinor || 0), currency || 'USD', provider || 'STRIPE');
      res.status(201).json(attempt);
    } catch (error) {
      next(error);
    }
  },

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await paymentService.verifyPayment(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      await paymentService.handleWebhook('stripe', req.body);
      res.status(200).send();
    } catch (error) {
      next(error);
    }
  }
};`;
fs.writeFileSync('server/src/modules/payment/payment.controller.ts', payCtrl);

let chkSrv = fs.readFileSync('server/src/modules/checkout/checkout.service.ts', 'utf-8');
chkSrv = chkSrv.replace(/status: 'ACTIVE' as const/g, "status: 'ACTIVE'");
fs.writeFileSync('server/src/modules/checkout/checkout.service.ts', chkSrv);

let invSrv = fs.readFileSync('server/src/modules/inventory/inventory.service.ts', 'utf-8');
invSrv = invSrv.replace(/status: 'ACTIVE' as const/g, "status: 'ACTIVE' as 'ACTIVE'");
fs.writeFileSync('server/src/modules/inventory/inventory.service.ts', invSrv);

let invTest1 = fs.readFileSync('server/tests/integration/inventory/inventory-concurrency.test.ts', 'utf-8');
invTest1 = invTest1.replace(/\.available \? 'ACTIVE' : 'FAILED'/g, ".status === 'fulfilled' ? 'ACTIVE' : 'FAILED'");
fs.writeFileSync('server/tests/integration/inventory/inventory-concurrency.test.ts', invTest1);

let invTest2 = fs.readFileSync('server/tests/unit/inventory/inventory.service.test.ts', 'utf-8');
invTest2 = invTest2.replace(/\.available \? 'ACTIVE' : 'FAILED'/g, ".status");
fs.writeFileSync('server/tests/unit/inventory/inventory.service.test.ts', invTest2);
