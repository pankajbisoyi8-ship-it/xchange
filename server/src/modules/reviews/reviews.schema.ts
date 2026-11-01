import { z } from 'zod';

export const createReviewSchema = z.object({
  productRating: z.number().int().min(1).max(5),
  sellerRating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

export const reportReviewSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters long')
});

export const replyReviewSchema = z.object({
  reply: z.string().min(2, 'Reply must be at least 2 characters long').max(500)
});

