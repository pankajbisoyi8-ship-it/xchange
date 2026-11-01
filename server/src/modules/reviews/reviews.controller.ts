import { Request, Response, NextFunction } from 'express';
import { reviewsService } from './reviews.service.js';

export class ReviewsController {
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewsService.createReview(
        req.user!.id,
        req.params.orderId,
        req.body
      );
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }

  async getListingReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await reviewsService.getListingReviews(req.params.listingId);
      res.json({ success: true, data: reviews });
    } catch (error) {
      next(error);
    }
  }

  async replyToReview(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reviewsService.replyToReview(
        req.user!.id,
        req.params.id,
        req.body.reply
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async reportReview(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reviewsService.reportReview(
        req.user!.id,
        req.params.id,
        req.body.reason
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async hideReview(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reviewsService.hideReview(
        req.user!.id,
        req.params.id,
        req.body.hidden !== false
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const reviewsController = new ReviewsController();

