const fs = require('fs');
let app = fs.readFileSync('server/src/app.ts', 'utf-8');
app = app.replace("import { orderRoutes } from './modules/order/order.routes';", "import { orderRoutes } from './modules/order/order.routes';\nimport { shippingRoutes } from './modules/shipping/shipping.routes';");
app = app.replace("app.use('/api/v1/orders', orderRoutes);", "app.use('/api/v1/orders', orderRoutes);\n  app.use('/api/v1', shippingRoutes);");
fs.writeFileSync('server/src/app.ts', app);
