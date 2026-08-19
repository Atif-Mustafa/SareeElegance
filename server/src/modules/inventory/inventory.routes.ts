import { Router } from 'express';
import { inventoryController } from './inventory.controller';

const router = Router();

router.get('/inventory/:productId/availability', inventoryController.getAvailability);
router.post('/inventory/reserve', inventoryController.reserve);
router.post('/inventory/reservations/:reservationId/release', inventoryController.release);

export { router as inventoryRoutes };
