import { Role, AccountStatus } from '../../lib/prismaCompat.js';
import { prisma } from '../../lib/prisma.js';
import { hashPassword, verifyPassword } from '../../lib/hash.js';
import { signAccessToken, generateRefreshToken, hashToken } from '../../lib/jwt.js';
import { AppError } from '../../middleware/errorHandler.js';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';

export class AuthService {
  async register(data: { email: string; password: string; name: string; phone?: string; area?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
    }

    if (data.phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (existingPhone) {
        throw new AppError('An account with this phone number already exists.', 409, 'PHONE_EXISTS');
      }
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        area: data.area,
        role: Role.USER,
        status: AccountStatus.ACTIVE,
        emailVerified: true // auto-verify for dev
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        area: true,
        createdAt: true
      }
    });

    const accessToken = signAccessToken({ userId: user.id, role: user.role, email: user.email });
    const { token: refreshToken, hash: refreshHash } = generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXPIRES_IN_DAYS);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshHash,
        expiresAt
      }
    });

    return { user, accessToken, refreshToken };
  }

  async login(data: { email: string; password: string; portalRole?: Role; userAgent?: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status === AccountStatus.SUSPENDED) {
      throw new AppError('This account has been suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED');
    }

    // Role portal check (PRD: separate login routes for each role)
    if (data.portalRole && user.role !== data.portalRole) {
      if (data.portalRole === Role.ADMIN) {
        throw new AppError('Access denied: You do not have administrator privileges.', 403, 'FORBIDDEN');
      } else if (data.portalRole === Role.AGENT) {
        throw new AppError('Access denied: This portal is reserved for registered Field Agents.', 403, 'FORBIDDEN');
      } else if (data.portalRole === Role.USER && user.role !== Role.USER) {
        // Staff logging into user portal is allowed or can be directed
      }
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role, email: user.email });
    const { token: refreshToken, hash: refreshHash } = generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXPIRES_IN_DAYS);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshHash,
        userAgent: data.userAgent,
        expiresAt
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'AUTH_LOGIN',
        entity: 'User',
        entityId: user.id,
        meta: { role: user.role, ip: 'login-session' }
      }
    });

    const userProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      area: user.area
    };

    return { user: userProfile, accessToken, refreshToken };
  }

  async refreshToken(rawToken: string, userAgent?: string) {
    const tokenHash = hashToken(rawToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!storedToken) {
      throw new AppError('Invalid refresh token.', 401, 'INVALID_TOKEN');
    }

    if (storedToken.revokedAt) {
      // Possible token theft! Revoke all tokens for this user family
      logger.warn({ userId: storedToken.userId }, 'Reused revoked refresh token detected! Revoking token family.');
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revokedAt: new Date() }
      });
      throw new AppError('Refresh token was revoked. Please log in again.', 401, 'TOKEN_REVOKED');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new AppError('Refresh token expired. Please log in again.', 401, 'TOKEN_EXPIRED');
    }

    // Rotate: revoke current and issue new
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() }
    });

    const { token: newRefreshToken, hash: newHash } = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXPIRES_IN_DAYS);

    await prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: newHash,
        userAgent,
        expiresAt
      }
    });

    const newAccessToken = signAccessToken({
      userId: storedToken.user.id,
      role: storedToken.user.role,
      email: storedToken.user.email
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        name: storedToken.user.name,
        role: storedToken.user.role,
        status: storedToken.user.status,
        area: storedToken.user.area
      }
    };
  }

  async logout(rawToken: string) {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() }
    });
  }
}

export const authService = new AuthService();

