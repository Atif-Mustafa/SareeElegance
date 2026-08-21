import { Router } from 'express';
import { customerController } from './customer.controller';
import { authenticateCustomer } from '../../common/middleware/auth';

const router = Router();

// All /api/v1/me routes require authentication
router.use(authenticateCustomer);

router.get('/profile', (req, res, next) => customerController.getProfile(req, res, next));
router.patch('/profile', (req, res, next) => customerController.updateProfile(req, res, next));

router.get('/addresses', (req, res, next) => customerController.getAddresses(req, res, next));
router.post('/addresses', (req, res, next) => customerController.createAddress(req, res, next));
router.delete('/addresses/:addressId', (req, res, next) => customerController.deleteAddress(req, res, next));

router.get('/orders', (req, res, next) => customerController.getOrders(req, res, next));
router.post('/orders/claim', (req, res, next) => customerController.claimOrder(req, res, next));

export { router as customerRouter };
