import { Request, Response, NextFunction } from 'express';
import { catalogService } from './catalog.service';
import { CatalogQuerySchema } from '../../../../shared/schemas/catalog';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryResult = CatalogQuerySchema.safeParse(req.query);
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

    const response = await catalogService.getProducts(queryResult.data);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const product = await catalogService.getProductBySlug(slug);

    if (!product) {
      return res.status(404).json({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        code: 'NOT_FOUND',
        detail: 'Product not found',
        instance: req.originalUrl,
        requestId: (req as any).requestId,
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await catalogService.getCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
