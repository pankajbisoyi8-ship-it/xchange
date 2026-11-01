import { Router } from 'express';
import { inspectionsController } from './inspections.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.AGENT));

router.get('/tasks', inspectionsController.getMyTasks);
router.get('/available-orders', inspectionsController.getAvailableOrders);
router.post('/orders/:id/claim', inspectionsController.claimOrder);
router.post('/orders/:id/schedule-pickup', inspectionsController.schedulePickup);
router.post('/orders/:id/pickup', inspectionsController.markPickedUp);
router.post('/orders/:id/inspection', inspectionsController.submitInspection);
router.post('/orders/:id/out-for-delivery', inspectionsController.markOutForDelivery);
router.post('/orders/:id/deliver', inspectionsController.deliverOrder);
router.post('/orders/:id/refuse', inspectionsController.refuseDelivery);
router.post('/orders/:id/return-pickup', inspectionsController.pickupReturn);
router.post('/orders/:id/return-complete', inspectionsController.completeReturn);

export const inspectionsRouter = router;

