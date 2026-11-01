import { OrderStatus, ListingStatus, Role, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { generateOtp, hashOtp } from '../../lib/otp.js';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { invalidateListingCache } from '../listings/listings.service.js';

export class OrdersService {
  async createOrder(buyerId: string, data: { listingId: string; deliveryAddress: any }) {
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: { seller: true }
    });

    if (!listing) {
      throw new AppError('Listing not found', 404, 'NOT_FOUND');
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      throw new AppError('This item is no longer available for purchase.', 400, 'LISTING_UNAVAILABLE');
    }

    if (listing.sellerId === buyerId) {
      throw new AppError('You cannot purchase your own listing.', 400, 'SELF_PURCHASE');
    }

    const itemPrice = Number(listing.price);
    const deliveryFee = Number(env.DEFAULT_DELIVERY_FEE);
    const commission = Number(((itemPrice * env.COMMISSION_PERCENTAGE) / 100).toFixed(2));
    const totalToCollect = itemPrice + deliveryFee;

    // Generate secure 6-digit delivery OTP
    const rawDeliveryOtp = generateOtp(6);
    const deliveryOtpHash = await hashOtp(rawDeliveryOtp);

    const order = await prisma.$transaction(async (tx) => {
      // 1. Mark listing as RESERVED
      await tx.listing.update({
        where: { id: listing.id },
        data: { status: ListingStatus.RESERVED }
      });

      // 2. Create the Order
      const newOrder = await tx.order.create({
        data: {
          listingId: listing.id,
          buyerId,
          status: OrderStatus.PLACED,
          itemPrice,
          deliveryFee,
          commission,
          totalToCollect,
          deliveryAddress: data.deliveryAddress,
          deliveryOtpHash,
          history: {
            create: {
              status: OrderStatus.PLACED,
              actorId: buyerId,
              note: 'Order placed by buyer via Cash on Delivery'
            }
          }
        },
        include: {
          listing: {
            include: {
              images: { take: 1, orderBy: { position: 'asc' } }
            }
          }
        }
      });

      // 3. Write audit log
      await tx.auditLog.create({
        data: {
          actorId: buyerId,
          action: 'ORDER_PLACED',
          entity: 'Order',
          entityId: newOrder.id,
          meta: { itemPrice, totalToCollect, listingId: listing.id }
        }
      });

      return newOrder;
    }, { maxWait: 15000, timeout: 30000 });

    logger.info({ orderId: order.id, buyerId, otp: rawDeliveryOtp }, 'Order placed successfully');

    invalidateListingCache();

    // Return the created order along with the OTP (for buyer's view)
    return {
      ...order,
      deliveryOtp: rawDeliveryOtp // buyer needs this OTP when agent arrives
    };
  }

  async getMyOrders(userId: string) {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { listing: { sellerId: userId } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: {
            images: { take: 1, orderBy: { position: 'asc' } },
            category: true,
            seller: {
              select: { id: true, name: true, phone: true }
            }
          }
        },
        buyer: {
          select: { id: true, name: true, phone: true }
        },
        agent: {
          select: { id: true, name: true, phone: true }
        },
        inspection: {
          include: { photos: true }
        },
        review: true
      }
    });

    return orders.map(order => ({
      ...order,
      isBuyer: order.buyerId === userId,
      isSeller: order.listing.sellerId === userId
    }));
  }

  async getOrderById(orderId: string, user: { id: string; role: Role }) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: {
          include: {
            images: true,
            category: true,
            seller: {
              select: { id: true, name: true, phone: true, area: true }
            }
          }
        },
        buyer: {
          select: { id: true, name: true, phone: true, area: true }
        },
        agent: {
          select: { id: true, name: true, phone: true, area: true }
        },
        history: {
          orderBy: { createdAt: 'asc' }
        },
        inspection: {
          include: { photos: true }
        },
        review: true,
        cash: true
      }
    });

    if (!order) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }

    const isBuyer = order.buyerId === user.id;
    const isSeller = order.listing.sellerId === user.id;
    const isAgent = order.agentId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isBuyer && !isSeller && !isAgent && !isAdmin) {
      throw new AppError('You do not have permission to view this order.', 403, 'FORBIDDEN');
    }

    return {
      ...order,
      isBuyer,
      isSeller,
      isAgent,
      isAdmin
    };
  }

  async cancelOrder(orderId: string, user: { id: string; role: Role }, reason: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true }
    });

    if (!order) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.DELIVERED) {
      throw new AppError(`Cannot cancel an order in ${order.status} state.`, 400, 'INVALID_STATE');
    }

    // Buyer can only cancel before item is picked up
    const isBuyer = order.buyerId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (isBuyer) {
      const allowedBuyerStatuses: OrderStatus[] = [OrderStatus.PLACED, OrderStatus.AGENT_ASSIGNED, OrderStatus.PICKUP_SCHEDULED];
      if (!allowedBuyerStatuses.includes(order.status)) {
        throw new AppError('Item is already in transit or inspected. Only Platform Admins can cancel at this stage.', 400, 'CANNOT_CANCEL');
      }
    } else if (!isAdmin) {
      throw new AppError('You do not have permission to cancel this order.', 403, 'FORBIDDEN');
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Release listing back to ACTIVE
      await tx.listing.update({
        where: { id: order.listingId },
        data: { status: ListingStatus.ACTIVE }
      });

      // 2. Update Order status
      const cancelledOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelReason: reason,
          history: {
            create: {
              status: OrderStatus.CANCELLED,
              actorId: user.id,
              note: `Order cancelled by ${user.role}. Reason: ${reason}`
            }
          }
        }
      });

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: 'ORDER_CANCELLED',
          entity: 'Order',
          entityId: order.id,
          meta: { reason }
        }
      });

      return cancelledOrder;
    }, { maxWait: 15000, timeout: 30000 });

    return updated;
  }
}

export const ordersService = new OrdersService();

