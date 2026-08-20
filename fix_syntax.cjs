const fs = require('fs');
let inv = fs.readFileSync('server/src/modules/inventory/inventory.service.ts', 'utf-8');
inv = inv.replace(/async checkAvailability/, "  async checkAvailability");
fs.writeFileSync('server/src/modules/inventory/inventory.service.ts', inv);

let pay = fs.readFileSync('server/src/modules/payment/payment.service.ts', 'utf-8');
pay = pay.replace(/async createPaymentAttempt/, "  async createPaymentAttempt");
fs.writeFileSync('server/src/modules/payment/payment.service.ts', pay);
