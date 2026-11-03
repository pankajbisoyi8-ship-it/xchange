import { z } from 'zod';
import { Condition } from '../../lib/prismaCompat.js';

export const createListingSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  title: z.string().min(5, 'Title must be at least 5 characters long').max(120),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  condition: z.nativeEnum(Condition),
  ageMonths: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(100, 'Price must be at least ₹100 / $10'),
  area: z.string().min(2, 'Pickup area / city is required'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  specs: z.record(z.any()), // category-specific dynamic specs
  images: z.array(z.string().url()).min(1, 'At least 1 photo is required').max(8, 'Maximum 8 photos allowed')
});

export const updateListingSchema = createListingSchema.partial();

export const queryListingsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  condition: z.nativeEnum(Condition).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  area: z.string().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12)
});

