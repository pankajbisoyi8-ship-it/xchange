import { Request, Response, NextFunction } from 'express';
import { Role, AccountStatus } from '@prisma/client';
import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from './errorHandler.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  status: AccountStatus;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing or invalid Bearer token.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Access token expired. Please refresh your session.', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Invalid access token.', 401, 'INVALID_TOKEN');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        name: true
      }
    });

    if (!user) {
      throw new AppError('User account not found.', 401, 'USER_NOT_FOUND');
    }

    if (user.status === AccountStatus.SUSPENDED) {
      throw new AppError('Your account has been suspended. Please contact platform support.', 403, 'ACCOUNT_SUSPENDED');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}
