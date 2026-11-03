import { Request, Response, NextFunction } from 'express';
import { Role } from '../../lib/prismaCompat.js';
import { authService } from './auth.service.js';
import { env } from '../../config/env.js';

const COOKIE_NAME = 'partxchange_refresh_token';

function setRefreshTokenCookie(res: Response, token: string) {
  const maxAge = env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/'
  });
}

function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      setRefreshTokenCookie(res, refreshToken);
      res.status(201).json({
        success: true,
        data: { user, accessToken }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login({
        ...req.body,
        portalRole: Role.USER,
        userAgent: req.headers['user-agent']
      });
      setRefreshTokenCookie(res, refreshToken);
      res.status(200).json({
        success: true,
        data: { user, accessToken }
      });
    } catch (error) {
      next(error);
    }
  }

  async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login({
        ...req.body,
        portalRole: Role.ADMIN,
        userAgent: req.headers['user-agent']
      });
      setRefreshTokenCookie(res, refreshToken);
      res.status(200).json({
        success: true,
        data: { user, accessToken }
      });
    } catch (error) {
      next(error);
    }
  }

  async agentLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login({
        ...req.body,
        portalRole: Role.AGENT,
        userAgent: req.headers['user-agent']
      });
      setRefreshTokenCookie(res, refreshToken);
      res.status(200).json({
        success: true,
        data: { user, accessToken }
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
      if (!token) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'No refresh token provided.' }
        });
        return;
      }

      const { user, accessToken, refreshToken } = await authService.refreshToken(
        token,
        req.headers['user-agent']
      );
      setRefreshTokenCookie(res, refreshToken);
      res.status(200).json({
        success: true,
        data: { user, accessToken }
      });
    } catch (error) {
      clearRefreshTokenCookie(res);
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.[COOKIE_NAME];
      if (token) {
        await authService.logout(token);
      }
      clearRefreshTokenCookie(res);
      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully.' }
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      data: { user: req.user }
    });
  }
}

export const authController = new AuthController();

