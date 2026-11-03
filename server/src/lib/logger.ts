import pino from 'pino';
import { env } from '../config/env.js';

// In serverless environments and bundled scripts, worker-thread transports (pino-pretty) cannot be resolved.
const usePretty = false;

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
