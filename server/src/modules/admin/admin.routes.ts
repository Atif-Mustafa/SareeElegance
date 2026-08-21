import { Router } from 'express';
import { adminController } from './admin.controller';
import { requireOperationsOrAdmin, requireAdmin } from '../../common/middleware/auth';

const router = Router();

// 1. Admin Authentication
router.post('/auth/login', adminController.login.bind(adminController));
router.get('/auth/me', requireOperationsOrAdmin, adminController.getMe.bind(adminController));

// 2. Catalog Management
router.get('/catalog/products', requireOperationsOrAdmin, adminController.getProducts.bind(adminController));
router.get('/catalog/products/:id', requireOperationsOrAdmin, adminController.getProductById.bind(adminController));
router.post('/catalog/products', requireOperationsOrAdmin, adminController.createProduct.bind(adminController));
router.patch('/catalog/products/:id', requireOperationsOrAdmin, adminController.updateProduct.bind(adminController));
router.patch('/catalog/products/:id/status', requireOperationsOrAdmin, adminController.updateProductStatus.bind(adminController));
router.patch('/catalog/products/:id/price', requireOperationsOrAdmin, adminController.updateProductPrice.bind(adminController));
router.get('/catalog/categories', requireOperationsOrAdmin, adminController.getCategories.bind(adminController));

// 3. Inventory Operations
router.get('/inventory', requireOperationsOrAdmin, adminController.getInventory.bind(adminController));
router.get('/inventory/:productId/history', requireOperationsOrAdmin, adminController.getProductInventoryHistory.bind(adminController));
router.post('/inventory/adjust', requireOperationsOrAdmin, adminController.adjustStock.bind(adminController));

// 4. Fulfillment Console
router.get('/fulfillment/orders', requireOperationsOrAdmin, adminController.getOrders.bind(adminController));
router.get('/fulfillment/orders/:id', requireOperationsOrAdmin, adminController.getOrderDetails.bind(adminController));
router.post('/fulfillment/orders/:id/prepare', requireOperationsOrAdmin, adminController.prepareOrder.bind(adminController));
router.post('/fulfillment/orders/:id/dispatch', requireOperationsOrAdmin, adminController.dispatchOrder.bind(adminController));
router.get('/fulfillment/handoffs', requireOperationsOrAdmin, adminController.getHandoffs.bind(adminController));

// 5. Shipping Monitor
router.get('/shipping/shipments', requireOperationsOrAdmin, adminController.getShipments.bind(adminController));
router.get('/shipping/shipments/:id', requireOperationsOrAdmin, adminController.getShipmentById.bind(adminController));
router.post('/shipping/shipments/:orderId/retry', requireOperationsOrAdmin, adminController.retryShipment.bind(adminController));

// 6. Returns Desk
router.get('/returns', requireOperationsOrAdmin, adminController.getReturns.bind(adminController));
router.get('/returns/:id', requireOperationsOrAdmin, adminController.getReturnById.bind(adminController));
router.post('/returns/:id/approve', requireOperationsOrAdmin, adminController.approveReturn.bind(adminController));
router.post('/returns/:id/reject', requireOperationsOrAdmin, adminController.rejectReturn.bind(adminController));
router.post('/returns/:id/inspect', requireOperationsOrAdmin, adminController.inspectReturn.bind(adminController));
router.post('/returns/:id/refund', requireOperationsOrAdmin, adminController.issueRefund.bind(adminController));

// 7. Reconciliation Queue
router.get('/reconciliation/exceptions', requireOperationsOrAdmin, adminController.getReconciliationExceptions.bind(adminController));
router.post('/reconciliation/orders/:orderId/retry', requireOperationsOrAdmin, adminController.retryReconciliationOrder.bind(adminController));

// 8. Admin Audit Trail
router.get('/audit-logs', requireOperationsOrAdmin, adminController.getAuditLogs.bind(adminController));

export const adminRoutes = router;
