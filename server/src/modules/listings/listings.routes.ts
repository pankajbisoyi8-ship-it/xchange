import { Router } from 'express';
import { listingsController } from './listings.controller.js';
import { validate } from '../../middleware/validate.js';
import { createListingSchema, updateListingSchema, queryListingsSchema } from './listings.schema.js';
import { authenticate } from '../../middleware/auth.js';
import { upload } from '../../lib/storage.js';

const router = Router();

// Public discovery endpoints
router.get('/categories', listingsController.getCategories);
router.get('/categories/:slug', listingsController.getCategoryBySlug);
router.get('/', validate({ query: queryListingsSchema }), listingsController.queryListings);
router.get('/:id', listingsController.getListingById);

// Authenticated endpoints
router.post(
  '/upload',
  authenticate,
  upload.single('image'),
  listingsController.uploadImage
);

router.post(
  '/',
  authenticate,
  validate({ body: createListingSchema }),
  listingsController.createListing
);

router.get('/user/mine', authenticate, listingsController.getMyListings);

router.patch(
  '/:id',
  authenticate,
  validate({ body: updateListingSchema }),
  listingsController.updateListing
);

export const listingsRouter = router;

