import { Router } from 'express';
import { reviewsController } from './reviews.controller.js';
import { validate } from '../../middleware/validate.js';
import { createReviewSchema, reportReviewSchema, replyReviewSchema } from './reviews.schema.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// Public
router.get('/listing/:listingId', reviewsController.getListingReviews);

// Authenticated
router.post(
  '/orders/:orderId',
  authenticate,
  validate({ body: createReviewSchema }),
  reviewsController.createReview
);

router.post(
  '/:id/reply',
  authenticate,
  validate({ body: replyReviewSchema }),
  reviewsController.replyToReview
);

router.post(
  '/:id/report',
  authenticate,
  validate({ body: reportReviewSchema }),
  reviewsController.reportReview
);

// Admin moderation
router.patch(
  '/:id/hide',
  authenticate,
  authorize(Role.ADMIN),
  reviewsController.hideReview
);

export const reviewsRouter = router;

