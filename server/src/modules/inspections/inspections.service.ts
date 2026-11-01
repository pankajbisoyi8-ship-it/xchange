import { OrderStatus, ListingStatus, CashStatus, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { verifyOtp } from '../../lib/otp.js';
import { logger } from '../../lib/logger.js';

export class InspectionsService {
  async getAgentTasks(agentId: string) {
    return prisma.order.findMany({
      where: {
        agentId,
        status: {
          notIn: [OrderStatus.CANCELLED]
        }
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        listing: {
          include: {
            images: { take: 1, orderBy: { position: 'asc' } },
            category: true,
            seller: {
              select: { id: true, name: true, phone: true, area: true }
            }
          }
        },
        buyer: {
          select: { id: true, name: true, phone: true, area: true }
        },
        inspection: {
          include: { photos: true }
        },
        cash: true
      }
    });
  }

  async schedulePickup(orderId: string, agentId: string, notes?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.agentId !== agentId) throw new AppError('Not assigned to this order', 403, 'FORBIDDEN');

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PICKUP_SCHEDULED,
        pickupNotes: notes,
        history: {
          create: {
            status: OrderStatus.PICKUP_SCHEDULED,
            actorId: agentId,
            note: notes || 'Pickup scheduled with seller'
          }
        }
      }
    });
  }

  async markPickedUp(orderId: string, agentId: string, notes?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.agentId !== agentId) throw new AppError('Not assigned to this order', 403, 'FORBIDDEN');

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PICKED_UP,
        history: {
          create: {
            status: OrderStatus.PICKED_UP,
            actorId: agentId,
            note: notes || 'Item collected from seller custody'
          }
        }
      }
    });
  }

  async submitInspection(agentId: string, orderId: string, data: {
    passed: boolean;
    checklist: any;
    serialNo?: string;
    notes?: string;
    photos: string[];
  }) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true }
    });

    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.agentId !== agentId) throw new AppError('Not assigned to this order', 403, 'FORBIDDEN');
    if (order.status !== OrderStatus.PICKED_UP) {
      throw new AppError('Item must be marked as PICKED_UP before performing inspection.', 400, 'INVALID_STATE');
    }

    if (!data.photos || data.photos.length < 2) {
      throw new AppError('At least 2 inspection photos are required for evidence.', 400, 'INSUFFICIENT_PHOTOS');
    }

    const nextStatus = data.passed ? OrderStatus.INSPECTION_PASSED : OrderStatus.INSPECTION_FAILED;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create inspection record
      const inspection = await tx.inspection.create({
        data: {
          orderId,
          agentId,
          passed: data.passed,
          checklist: data.checklist,
          serialNo: data.serialNo,
          notes: data.notes,
          photos: {
            create: data.photos.map(url => ({ url }))
          }
        },
        include: { photos: true }
      });

      // 2. Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: nextStatus,
          history: {
            create: {
              status: nextStatus,
              actorId: agentId,
              note: data.passed
                ? 'Hardware passed all inspection checklist tests'
                : `Inspection FAILED: ${data.notes || 'Hardware failed checklist criteria'}`
            }
          }
        }
      });

      // 3. If passed, mark listing as platform inspected
      if (data.passed) {
        await tx.listing.update({
          where: { id: order.listingId },
          data: { isInspected: true }
        });
      } else {
        // If failed, order is cancelled and listing returned to DRAFT/REJECTED
        await tx.listing.update({
          where: { id: order.listingId },
          data: {
            status: ListingStatus.REJECTED,
            rejectReason: `Failed agent physical inspection: ${data.notes || 'Defects detected'}`
          }
        });
      }

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          actorId: agentId,
          action: 'INSPECTION_SUBMITTED',
          entity: 'Inspection',
          entityId: inspection.id,
          meta: { orderId, passed: data.passed, serialNo: data.serialNo }
        }
      });

      return { inspection, order: updatedOrder };
    }, { maxWait: 15000, timeout: 30000 });

    return result;
  }

  async markOutForDelivery(orderId: string, agentId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.agentId !== agentId) throw new AppError('Not assigned to this order', 403, 'FORBIDDEN');
    if (order.status !== OrderStatus.INSPECTION_PASSED) {
      throw new AppError('Item must pass inspection before going out for delivery.', 400, 'INVALID_STATE');
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.OUT_FOR_DELIVERY,
        history: {
          create: {
            status: OrderStatus.OUT_FOR_DELIVERY,
            actorId: agentId,
            note: 'Agent is out for delivery to buyer address'
          }
        }
      }
    });
  }

  async deliverOrder(orderId: string, agentId: string, otp: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true }
    });

    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.agentId !== agentId) throw new AppError('Not assigned to this order', 403, 'FORBIDDEN');
    if (order.status !== OrderStatus.OUT_FOR_DELIVERY && order.status !== OrderStatus.INSPECTION_PASSED) {
      throw new AppError('Order is not in delivery phase.', 400, 'INVALID_STATE');
    }

    if (!order.deliveryOtpHash) {
      throw new AppError('Delivery OTP verification record is missing.', 500, 'SERVER_ERROR');
    }

    const isOtpValid = await verifyOtp(otp, order.deliveryOtpHash);
    if (!isOtpValid) {
      throw new AppError('Invalid delivery OTP entered. Please verify with the buyer.', 400, 'INVALID_OTP');
    }

    const sellerPayout = Number(order.itemPrice) - Number(order.commission);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark Order as DELIVERED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.DELIVERED,
          history: {
            create: {
              status: OrderStatus.DELIVERED,
              actorId: agentId,
              note: `Delivered to buyer. OTP verified. Cash collected: ₹${order.totalToCollect}`
            }
          }
        }
      });

      // 2. Mark Listing as SOLD
      await tx.listing.update({
        where: { id: order.listingId },
        data: { status: ListingStatus.SOLD }
      });

      // 3. Create Cash Entry for settlement ledger
      const cashEntry = await tx.cashEntry.create({
        data: {
          orderId,
          agentId,
          amount: order.totalToCollect,
          sellerPayout,
          status: CashStatus.WITH_AGENT
        }
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          actorId: agentId,
          action: 'ORDER_DELIVERED',
          entity: 'Order',
          entityId: order.id,
          meta: { collectedAmount: order.totalToCollect, sellerPayout }
        }
      });

      return { order: updatedOrder, cash: cashEntry };
    }, { maxWait: 15000, timeout: 30000 });

    logger.info({ orderId, collected: order.totalToCollect }, 'Order delivered and cash recorded');
    return result;
  }

  async refuseDelivery(orderId: string, agentId: string, reason: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.agentId !== agentId) throw new AppError('Not assigned to this order', 403, 'FORBIDDEN');

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.DELIVERY_REFUSED,
        refusalReason: reason,
        history: {
          create: {
            status: OrderStatus.DELIVERY_REFUSED,
            actorId: agentId,
            note: `Buyer refused delivery. Reason: ${reason}. Awaiting Admin return approval.`
          }
        }
      }
    });
  }

  async getAvailableOrdersToClaim(agentId: string) {
    // Orders placed and ready for auto-dispatch / pickup
    return prisma.order.findMany({
      where: {
        status: OrderStatus.PLACED,
        agentId: null
      },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: {
            images: { take: 1, orderBy: { position: 'asc' } },
            category: true,
            seller: {
              select: { id: true, name: true, phone: true, area: true }
            }
          }
        },
        buyer: {
          select: { id: true, name: true, phone: true, area: true }
        }
      }
    });
  }

  async claimOrder(orderId: string, agentId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true }
    });

    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.status !== OrderStatus.PLACED) {
      throw new AppError('Order is no longer available for auto-dispatch claiming.', 400, 'UNAVAILABLE');
    }

    const agent = await prisma.user.findUnique({ where: { id: agentId } });

    return prisma.order.update({
      where: { id: orderId },
      data: {
        agentId,
        status: OrderStatus.AGENT_ASSIGNED,
        history: {
          create: {
            status: OrderStatus.AGENT_ASSIGNED,
            actorId: agentId,
            note: `Auto-dispatched: Order claimed by Field Agent ${agent?.name || ''} for inspection and shipping`
          }
        }
      },
      include: {
        listing: true,
        buyer: true
      }
    });
  }

  async pickupReturnFromCustomer(orderId: string, agentId: string, notes?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.agentId !== agentId) throw new AppError('Not assigned to this order', 403, 'FORBIDDEN');
    if (order.status !== ('RETURN_APPROVED' as any)) {
      throw new AppError('Return must be approved by Platform Admin before pickup from customer.', 400, 'RETURN_NOT_APPROVED');
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'RETURN_IN_TRANSIT' as any,
        returnNotes: notes,
        history: {
          create: {
            status: 'RETURN_IN_TRANSIT' as any,
            actorId: agentId,
            note: notes || 'Rejected item picked up from customer. Returning to seller.'
          }
        }
      }
    });
  }

  async completeReturnToSeller(orderId: string, agentId: string, notes?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true }
    });

    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.agentId !== agentId) throw new AppError('Not assigned to this order', 403, 'FORBIDDEN');
    if (order.status !== ('RETURN_IN_TRANSIT' as any)) {
      throw new AppError('Item must be in transit for return.', 400, 'INVALID_STATE');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Mark Order as returned to seller
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'RETURNED_TO_SELLER' as any,
          history: {
            create: {
              status: 'RETURNED_TO_SELLER' as any,
              actorId: agentId,
              note: notes || 'Hardware safely returned and handed back to seller custody.'
            }
          }
        }
      });

      // 2. Mark listing as rejected/returned
      await tx.listing.update({
        where: { id: order.listingId },
        data: { status: ListingStatus.REJECTED, rejectReason: 'Returned by customer' }
      });

      return updatedOrder;
    }, { maxWait: 15000, timeout: 30000 });
  }
}

export const inspectionsService = new InspectionsService();

