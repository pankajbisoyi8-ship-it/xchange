import { z } from 'zod';

export const createOrderSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  deliveryAddress: z.object({
    line1: z.string().min(3, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().min(4, 'Valid pincode/postal code is required'),
    phone: z.string().min(10, 'Valid contact phone number is required')
  })
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason for cancellation')
});

