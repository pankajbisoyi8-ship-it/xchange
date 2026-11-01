import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/profile', usersController.getProfile);
router.patch('/profile', usersController.updateProfile);
router.get('/addresses', usersController.getAddresses);
router.post('/addresses', usersController.addAddress);
router.delete('/addresses/:id', usersController.deleteAddress);

export const usersRouter = router;

