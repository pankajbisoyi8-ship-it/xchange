import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(10, 'Password must be at least 10 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  phone: z.string().min(10, 'Please provide a valid phone number').optional(),
  area: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const inviteAgentSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().min(10),
  area: z.string().min(2)
});

export const acceptInviteSchema = z.object({
  inviteToken: z.string(),
  password: z.string().min(10)
});

export const verifyPhoneSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6)
});
