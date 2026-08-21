import { Request, Response, NextFunction } from 'express';
import { customerService } from './customer.service';
import { updateProfileSchema, createAddressSchema, claimOrderSchema } from '../../../../shared/schemas/auth';
import { ApiError } from '../../common/errors/ApiError';

export class CustomerController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      if (!customerId) throw ApiError.unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED');

      const profile = await customerService.getProfile(customerId);
      res.status(200).json({ profile });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      if (!customerId) throw ApiError.unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED');

      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw ApiError.badRequest(parsed.error.issues[0]?.message || 'Invalid profile data', 'VALIDATION_ERROR');
      }

      const updated = await customerService.updateProfile(customerId, parsed.data);
      res.status(200).json({ profile: updated, message: 'Profile updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      if (!customerId) throw ApiError.unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED');

      const addresses = await customerService.getAddresses(customerId);
      res.status(200).json({ addresses });
    } catch (err) {
      next(err);
    }
  }

  async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      if (!customerId) throw ApiError.unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED');

      const parsed = createAddressSchema.safeParse(req.body);
      if (!parsed.success) {
        throw ApiError.badRequest(parsed.error.issues[0]?.message || 'Invalid address data', 'VALIDATION_ERROR');
      }

      const address = await customerService.createAddress(customerId, parsed.data);
      res.status(201).json({ address, message: 'Address added successfully' });
    } catch (err) {
      next(err);
    }
  }

  async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      if (!customerId) throw ApiError.unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED');

      const { addressId } = req.params;
      if (!addressId) throw ApiError.badRequest('Address ID is required');

      await customerService.deleteAddress(customerId, addressId);
      res.status(200).json({ success: true, message: 'Address deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      if (!customerId) throw ApiError.unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED');

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const result = await customerService.getCustomerOrders(customerId, page, limit);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async claimOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      if (!customerId) throw ApiError.unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED');

      const parsed = claimOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        throw ApiError.badRequest(parsed.error.issues[0]?.message || 'Invalid claim order data', 'VALIDATION_ERROR');
      }

      const result = await customerService.claimGuestOrder(customerId, parsed.data.orderId, parsed.data.accessToken);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const customerController = new CustomerController();
