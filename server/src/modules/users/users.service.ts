import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        area: true,
        createdAt: true,
        addresses: true,
        _count: {
          select: {
            listings: true,
            ordersBought: true,
            reviews: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; area?: string }) {
    if (data.phone) {
      const existing = await prisma.user.findFirst({
        where: { phone: data.phone, NOT: { id: userId } }
      });
      if (existing) {
        throw new AppError('Phone number already registered to another account.', 409, 'PHONE_EXISTS');
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        area: true
      }
    });
  }

  async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });
  }

  async addAddress(userId: string, data: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const count = await prisma.address.count({ where: { userId } });

    return prisma.address.create({
      data: {
        ...data,
        userId,
        isDefault: data.isDefault || count === 0
      }
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!address) {
      throw new AppError('Address not found', 404, 'NOT_FOUND');
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    return { message: 'Address removed successfully.' };
  }
}

export const usersService = new UsersService();

