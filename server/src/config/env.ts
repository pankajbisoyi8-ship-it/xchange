import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/partxchange?schema=public'),
  JWT_ACCESS_SECRET: z.string().min(16).default('partxchange_dev_access_secret_key_1234567890_min_32_chars'),
  JWT_REFRESH_SECRET: z.string().min(16).default('partxchange_dev_refresh_secret_key_1234567890_min_32_chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN_DAYS: z.coerce.number().default(30),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(5),
  COMMISSION_PERCENTAGE: z.coerce.number().default(5),
  DEFAULT_DELIVERY_FEE: z.coerce.number().default(200),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
