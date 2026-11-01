import { Router } from 'express';
import { ordersController } from './orders.controller.js';
import { validate } from '../../middleware/validate.js';
import { createOrderSchema, cancelOrderSchema } from './orders.schema.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: createOrderSchema }), ordersController.createOrder);
router.get('/', ordersController.getMyOrders);
router.get('/mine', ordersController.getMyOrders);
router.get('/:id', ordersController.getOrderById);
router.post('/:id/cancel', validate({ body: cancelOrderSchema }), ordersController.cancelOrder);

export const ordersRouter = router;

