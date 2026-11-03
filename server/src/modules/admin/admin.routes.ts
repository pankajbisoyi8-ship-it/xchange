import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/prismaCompat.js';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get('/stats', adminController.getDashboardStats);
router.get('/listings/pending', adminController.getPendingListings);
router.post('/listings/:id/approve', adminController.approveListing);
router.post('/listings/:id/reject', adminController.rejectListing);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.post('/agents/invite', adminController.inviteAgent);

router.get('/orders', adminController.getAllOrders);
router.get('/disputes', adminController.getDisputes);
router.post('/orders/:id/approve-return', adminController.approveReturn);
router.post('/orders/:id/assign', adminController.assignAgent);

router.get('/audit-logs', adminController.getAuditLogs);

export const adminRouter = router;

