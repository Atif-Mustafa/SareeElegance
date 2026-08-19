import { Router } from 'express';
import { validateCart } from './cart.controller';

const router = Router();

router.post('/cart/validate', validateCart);

export const cartRoutes = router;
