import { Router } from 'express';
import { cashController } from './cash.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { Role } from '../../lib/prismaCompat.js';

const router = Router();

router.use(authenticate);

// Agent Cash routes
router.get('/agent/summary', authorize(Role.AGENT), cashController.getAgentSummary);
router.post('/agent/remit', authorize(Role.AGENT), cashController.declareRemittance);

// Admin Cash Ledger routes
router.get('/admin/ledger', authorize(Role.ADMIN), cashController.getAdminLedger);
router.post('/admin/confirm-remittance/:id', authorize(Role.ADMIN), cashController.confirmRemittance);
router.post('/admin/release-payout/:id', authorize(Role.ADMIN), cashController.releasePayout);

export const cashRouter = router;

