import { OrderStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class ReviewsService {
  async createReview(buyerId: string, orderId: string, data: {
    productRating: number;
    sellerRating: number;
    comment?: string;
  }) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { review: true, listing: true }
    });

    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.buyerId !== buyerId) throw new AppError('Only the buyer of this delivered order can leave a review.', 403, 'FORBIDDEN');
    if (order.status !== OrderStatus.DELIVERED) {
      throw new AppError('Reviews can only be submitted after the item is delivered.', 400, 'NOT_DELIVERED');
    }
    if (order.review) {
      throw new AppError('You have already submitted a review for this order.', 400, 'ALREADY_REVIEWED');
    }

    const review = await prisma.review.create({
      data: {
        orderId,
        reviewerId: buyerId,
        productRating: data.productRating,
        sellerRating: data.sellerRating,
        comment: data.comment
      },
      include: {
        reviewer: { select: { id: true, name: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: buyerId,
        action: 'REVIEW_SUBMITTED',
        entity: 'Review',
        entityId: review.id,
        meta: { orderId, productRating: data.productRating, sellerRating: data.sellerRating }
      }
    });

    return review;
  }

  async getListingReviews(listingId: string) {
    return prisma.review.findMany({
      where: {
        hidden: false,
        order: { listingId }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { id: true, name: true } }
      }
    });
  }

  async replyToReview(sellerId: string, reviewId: string, reply: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { order: { include: { listing: true } } }
    });

    if (!review) throw new AppError('Review not found', 404, 'NOT_FOUND');
    if (review.order.listing.sellerId !== sellerId) {
      throw new AppError('Only the seller can reply to this review.', 403, 'FORBIDDEN');
    }

    return prisma.review.update({
      where: { id: reviewId },
      data: { sellerReply: reply }
    });
  }

  async reportReview(userId: string, reviewId: string, reason: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new AppError('Review not found', 404, 'NOT_FOUND');

    return prisma.review.update({
      where: { id: reviewId },
      data: { reportReason: reason }
    });
  }

  async hideReview(adminId: string, reviewId: string, hidden: boolean = true) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new AppError('Review not found', 404, 'NOT_FOUND');

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { hidden }
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: hidden ? 'REVIEW_HIDDEN' : 'REVIEW_UNHIDDEN',
        entity: 'Review',
        entityId: reviewId
      }
    });

    return updated;
  }
}

export const reviewsService = new ReviewsService();

