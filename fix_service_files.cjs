const fs = require('fs');
let inv = fs.readFileSync('server/src/modules/inventory/inventory.service.ts', 'utf-8');
// It looks like we appended outside the class brace.
inv = inv.replace('export const inventoryService = new InventoryService();', '');
inv = inv + '\nexport const inventoryService = new InventoryService();\n';
fs.writeFileSync('server/src/modules/inventory/inventory.service.ts', inv);

let pay = fs.readFileSync('server/src/modules/payment/payment.service.ts', 'utf-8');
pay = pay.replace('export const paymentService = new PaymentService();', '');
pay = pay + '\nexport const paymentService = new PaymentService();\n';
fs.writeFileSync('server/src/modules/payment/payment.service.ts', pay);
