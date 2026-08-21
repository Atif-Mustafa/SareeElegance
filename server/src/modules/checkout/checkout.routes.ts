import { Router, Request, Response, NextFunction } from 'express';
import { checkoutService } from './checkout.service';
import { createCheckoutSchema } from '../../../../shared/schemas/checkout';
import { ApiError } from '../../common/errors/ApiError';

export const checkoutRouter = Router();

checkoutRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = createCheckoutSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(ApiError.badRequest('Invalid checkout request: ' + parseResult.error.message, 'VALIDATION_ERROR'));
    }

    const session = await checkoutService.createCheckout(parseResult.data, req.customer?.id);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

checkoutRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await checkoutService.getCheckout(req.params.id);
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
});

checkoutRouter.post('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await checkoutService.cancelCheckout(req.params.id);
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
});
