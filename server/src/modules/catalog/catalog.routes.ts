import { Router } from 'express';
import { getProducts, getProductBySlug, getCategories } from './catalog.controller';

const router = Router();

router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);

export const catalogRoutes = router;
