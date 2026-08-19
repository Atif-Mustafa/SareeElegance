import { Request, Response, NextFunction } from 'express';
import { cartService } from './cart.service';
import { CartValidationRequestSchema } from '../../../../shared/schemas/cart';

export const validateCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryResult = CartValidationRequestSchema.safeParse(req.body);

    if (!queryResult.success) {
      return res.status(400).json({
        type: 'about:blank',
        title: 'Validation Error',
        status: 400,
        code: 'VALIDATION_001',
        detail: 'Input payload failed Zod schema validation.',
        instance: req.originalUrl,
        requestId: (req as any).requestId,
      });
    }

    const response = await cartService.validateCart(queryResult.data);

    res.status(200).json({
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId,
      }
    });
  } catch (error) {
    next(error);
  }
};
