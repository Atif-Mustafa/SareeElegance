const fs = require('fs');
let app = fs.readFileSync('server/src/app.ts', 'utf-8');
app = app.replace("import { shippingRoutes } from './modules/shipping/shipping.routes';", "import { shippingRoutes } from './modules/shipping/shipping.routes';\nimport { returnsRoutes } from './modules/returns/returns.routes';");
app = app.replace("app.use('/api/v1', shippingRoutes);", "app.use('/api/v1', shippingRoutes);\n  app.use('/api/v1', returnsRoutes);");
fs.writeFileSync('server/src/app.ts', app);
