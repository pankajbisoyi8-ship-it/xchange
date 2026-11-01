import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';

// Route modules
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { listingsRouter } from './modules/listings/listings.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { inspectionsRouter } from './modules/inspections/inspections.routes.js';
import { cashRouter } from './modules/cash/cash.routes.js';
import { reviewsRouter } from './modules/reviews/reviews.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';

export function createApp() {
  const app = express();

  // 1. Security & Core Middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger
  if (env.NODE_ENV !== 'test') {
    app.use(pinoHttp({ logger }));
  }

  // Rate Limiter
  app.use(globalLimiter);

  // 2. Serve static uploads & hardware images
  const baseUploadDir = process.env.VERCEL ? '/tmp/uploads' : env.UPLOAD_DIR;
  const uploadDir = path.resolve(process.cwd(), baseUploadDir);
  if (fs.existsSync(uploadDir)) {
    app.use('/uploads', express.static(uploadDir));
  }

  const rootImagesDir = path.resolve(process.cwd(), 'images');
  const parentImagesDir = path.resolve(process.cwd(), '../images');
  const localImagesDir = fs.existsSync(rootImagesDir) ? rootImagesDir : parentImagesDir;
  app.use('/images', express.static(localImagesDir));

  // 3. Health check
  const healthHandler = async (_req: express.Request, res: express.Response) => {
    let dbStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (e: any) {
      dbStatus = `error: ${e.message}`;
    }

    res.json({
      status: 'ok',
      database: dbStatus,
      service: 'PartXchange API',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV
    });
  };

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);
  app.get('/', (_req: express.Request, res: express.Response) => {
    res.json({
      status: 'ok',
      service: 'PartXchange API',
      timestamp: new Date().toISOString()
    });
  });

  // 4. API Endpoints (v1) - mounted on both /api/v1 and /v1 for routing flexibility
  const mountRoutes = (prefix: string) => {
    app.use(`${prefix}/auth`, authRouter);
    app.use(`${prefix}/users`, usersRouter);
    app.use(`${prefix}/listings`, listingsRouter);
    app.use(`${prefix}/orders`, ordersRouter);
    app.use(`${prefix}/agent`, inspectionsRouter);
    app.use(`${prefix}/cash`, cashRouter);
    app.use(`${prefix}/reviews`, reviewsRouter);
    app.use(`${prefix}/admin`, adminRouter);
  };

  mountRoutes('/api/v1');
  mountRoutes('/v1');

  // 5. 404 handler
  app.use('*', (req, _res, next) => {
    next(new AppError(`Endpoint ${req.method} ${req.originalUrl} not found`, 404, 'NOT_FOUND'));
  });

  // 6. Central Error Handler
  app.use(errorHandler);

  return app;
}

