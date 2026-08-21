import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../common/errors/ApiError';
import { adminCatalogService } from './admin.catalog.service';
import { adminInventoryService } from './admin.inventory.service';
import { adminFulfillmentService } from './admin.fulfillment.service';
import { adminShippingService } from './admin.shipping.service';
import { adminReturnsService } from './admin.returns.service';
import { adminReconciliationService } from './admin.reconciliation.service';
import { adminAuditService } from './admin.audit.service';
import { authService } from '../auth/auth.service';
import {
  AdminCreateProductSchema,
  AdminUpdateProductSchema,
  AdminUpdateProductStatusSchema,
  AdminUpdateProductPriceSchema,
  AdminInventoryAdjustSchema,
  AdminReturnInspectSchema,
  AdminReturnRejectSchema
} from '../../../../shared/schemas/admin';
import { loginSchema } from '../../../../shared/schemas/auth';

export class AdminController {
  // Auth
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = loginSchema.parse(req.body);

      // Check if email matches default seed admin and user not created yet
      if (body.email === 'admin@sareeelegance.com' || body.email === 'operations@sareeelegance.com') {
        await authService.ensureAdminUser(
          body.email,
          'Admin@123456',
          body.email === 'admin@sareeelegance.com' ? 'ADMIN' : 'OPERATIONS'
        );
      }

      const { customer, sessionToken } = await authService.login(body);

      if (customer.role !== 'ADMIN' && customer.role !== 'OPERATIONS') {
        throw ApiError.forbidden('Administrative account required for this console', 'FORBIDDEN');
      }

      res.cookie('session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        data: {
          admin: customer,
          sessionToken
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.customer) {
        throw ApiError.unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED');
      }
      res.status(200).json({
        success: true,
        data: req.customer
      });
    } catch (err) {
      next(err);
    }
  }

  // Catalog
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminCatalogService.getProducts(req.query as any);
      res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await adminCatalogService.getProductById(req.params.id);
      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = AdminCreateProductSchema.parse(req.body);
      const product = await adminCatalogService.createProduct(req.customer!, parsed);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = AdminUpdateProductSchema.parse(req.body);
      const product = await adminCatalogService.updateProduct(req.customer!, req.params.id, parsed);
      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async updateProductStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = AdminUpdateProductStatusSchema.parse(req.body);
      const product = await adminCatalogService.updateProductStatus(req.customer!, req.params.id, parsed);
      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async updateProductPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = AdminUpdateProductPriceSchema.parse(req.body);
      const product = await adminCatalogService.updateProductPrice(req.customer!, req.params.id, parsed);
      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await adminCatalogService.getCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  // Inventory
  async getInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await adminInventoryService.getInventoryList(req.query as any);
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  async getProductInventoryHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await adminInventoryService.getProductInventoryHistory(req.params.productId);
      res.status(200).json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  }

  async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = AdminInventoryAdjustSchema.parse(req.body);
      const result = await adminInventoryService.adjustStock(req.customer!, parsed);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // Fulfillment
  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminFulfillmentService.getOrders(req.query as any);
      res.status(200).json({
        success: true,
        data: result.orders,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getOrderDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await adminFulfillmentService.getOrderDetails(req.params.id);
      res.status(200).json({ success: true, data: details });
    } catch (err) {
      next(err);
    }
  }

  async prepareOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await adminFulfillmentService.prepareOrderFulfillment(req.customer!, req.params.id);
      res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async dispatchOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const shipment = await adminFulfillmentService.dispatchOrder(req.customer!, req.params.id);
      res.status(200).json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  }

  async getHandoffs(req: Request, res: Response, next: NextFunction) {
    try {
      const handoffs = await adminFulfillmentService.getHandoffs();
      res.status(200).json({ success: true, data: handoffs });
    } catch (err) {
      next(err);
    }
  }

  // Shipping
  async getShipments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminShippingService.getShipments(req.query as any);
      res.status(200).json({
        success: true,
        data: result.shipments,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getShipmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const shipment = await adminShippingService.getShipmentById(req.params.id);
      res.status(200).json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  }

  async retryShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const shipment = await adminShippingService.retryShipment(req.customer!, req.params.orderId);
      res.status(200).json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  }

  // Returns
  async getReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminReturnsService.getReturns(req.query as any);
      res.status(200).json({
        success: true,
        data: result.returns,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getReturnById(req: Request, res: Response, next: NextFunction) {
    try {
      const returnReq = await adminReturnsService.getReturnById(req.params.id);
      res.status(200).json({ success: true, data: returnReq });
    } catch (err) {
      next(err);
    }
  }

  async approveReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminReturnsService.approveReturn(req.customer!, req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async rejectReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = AdminReturnRejectSchema.parse(req.body);
      const result = await adminReturnsService.rejectReturn(req.customer!, req.params.id, parsed.reason);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async inspectReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = AdminReturnInspectSchema.parse(req.body);
      const result = await adminReturnsService.inspectReturn(req.customer!, req.params.id, parsed);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async issueRefund(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminReturnsService.issueRefund(req.customer!, req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Reconciliation
  async getReconciliationExceptions(req: Request, res: Response, next: NextFunction) {
    try {
      const exceptions = await adminReconciliationService.getExceptions();
      res.status(200).json({ success: true, data: exceptions });
    } catch (err) {
      next(err);
    }
  }

  async retryReconciliationOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await adminReconciliationService.retryOrderFulfillment(req.customer!, req.params.orderId);
      res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  // Audit Logs
  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 100;
      const logs = await adminAuditService.getRecentLogs(limit, {
        action: req.query.action as string,
        targetType: req.query.targetType as string,
        actorId: req.query.actorId as string
      });
      res.status(200).json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
