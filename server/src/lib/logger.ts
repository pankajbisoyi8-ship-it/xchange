import pino from 'pino';
import { env } from '../config/env.js';

// In serverless environments like Vercel, worker-thread transports (pino-pretty) cannot be resolved.
// Only use pino-pretty for local development when not running on Vercel.
const usePretty = env.NODE_ENV === 'development' && !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME;

export const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  ...(usePretty
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname'
          }
        }
      }
    : {})
});
