import pino from 'pino';
import { env } from '../config/env.js';

// In serverless environments like Vercel or AWS Lambda, worker-thread transports (pino-pretty) cannot be resolved.
// Only use pino-pretty for local non-serverless development.
const isServerless =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.LAMBDA_TASK_ROOT);

const usePretty = env.NODE_ENV === 'development' && !isServerless;

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
