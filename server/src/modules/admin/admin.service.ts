import { Role, AccountStatus, ListingStatus, OrderStatus, CashStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { hashPassword } from '../../lib/hash.js';

export class AdminService {
  async getDashboardStats() {
    const [
      activeListings,
      pendingListings,
      totalUsers,
      totalAgents,
      totalOrders,
      deliveredOrders,
      cashEntries,
      recentOrders,
      recentAudits
    ] = await Promise.all([
      prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
      prisma.listing.count({ where: { status: ListingStatus.PENDING_REVIEW } }),
      prisma.user.count({ where: { role: Role.USER } }),
      prisma.user.count({ where: { role: Role.AGENT } }),
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: OrderStatus.DELIVERED },
        select: { commission: true, itemPrice: true }
      }),
      prisma.cashEntry.findMany({ select: { amount: true, status: true, createdAt: true } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { select: { title: true } },
          buyer: { select: { name: true } },
          agent: { select: { name: true } }
        }
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { name: true, role: true } }
        }
      })
    ]);

    const totalCommission = deliveredOrders.reduce((sum, o) => sum + Number(o.commission), 0);
    const totalSalesVolume = deliveredOrders.reduce((sum, o) => sum + Number(o.itemPrice), 0);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const cashWithAgents = cashEntries
      .filter(e => e.status === CashStatus.WITH_AGENT)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const overdueRemittances = cashEntries.filter(
      e => e.status === CashStatus.WITH_AGENT && e.createdAt < twentyFourHoursAgo
    ).length;

    return {
      listings: {
        active: activeListings,
        pendingReview: pendingListings
      },
      users: {
        total: totalUsers,
        agents: totalAgents
      },
      orders: {
        total: totalOrders,
        delivered: deliveredOrders.length
      },
      financials: {
        totalCommission,
        totalSalesVolume,
        cashWithAgents,
        overdueRemittances
      },
      recentOrders,
      recentAudits
    };
  }

  async getPendingListings() {
    return prisma.listing.findMany({
      where: { status: ListingStatus.PENDING_REVIEW },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
        seller: {
          select: { id: true, name: true, email: true, phone: true, area: true, createdAt: true }
        }
      }
    });
  }

  async approveListing(adminId: string, listingId: string) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new AppError('Listing not found', 404, 'NOT_FOUND');

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.ACTIVE,
        rejectReason: null
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_APPROVE_LISTING',
        entity: 'Listing',
        entityId: listingId,
        meta: { title: listing.title }
      }
    });

    return updated;
  }

  async rejectListing(adminId: string, listingId: string, reason: string) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new AppError('Listing not found', 404, 'NOT_FOUND');

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.REJECTED,
        rejectReason: reason
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_REJECT_LISTING',
        entity: 'Listing',
        entityId: listingId,
        meta: { title: listing.title, reason }
      }
    });

    return updated;
  }

  async getUsers(role?: Role) {
    return prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        area: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            ordersBought: true,
            ordersAgent: true
          }
        }
      }
    });
  }

  async updateUserStatus(adminId: string, userId: string, status: AccountStatus) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_UPDATE_USER_STATUS',
        entity: 'User',
        entityId: userId,
        meta: { oldStatus: user.status, newStatus: status }
      }
    });

    return updated;
  }

  async inviteAgent(adminId: string, data: { email: string; name: string; phone: string; area: string; password?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');

    const defaultPassword = data.password || 'AgentPass123!';
    const passwordHash = await hashPassword(defaultPassword);

    const agent = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        area: data.area,
        role: Role.AGENT,
        status: AccountStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_INVITE_AGENT',
        entity: 'User',
        entityId: agent.id,
        meta: { email: agent.email, area: agent.area }
      }
    });

    return {
      agent,
      temporaryPassword: defaultPassword
    };
  }

  async assignAgentToOrder(adminId: string, orderId: string, agentId: string) {
    const [order, agent] = await Promise.all([
      prisma.order.findUnique({ where: { id: orderId } }),
      prisma.user.findUnique({ where: { id: agentId, role: Role.AGENT } })
    ]);

    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (!agent) throw new AppError('Specified Agent not found', 404, 'NOT_FOUND');

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        agentId,
        status: OrderStatus.AGENT_ASSIGNED,
        history: {
          create: {
            status: OrderStatus.AGENT_ASSIGNED,
            actorId: adminId,
            note: `Agent assigned: ${agent.name} (${agent.area || 'Field'})`
          }
        }
      },
      include: {
        agent: { select: { id: true, name: true, phone: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_ASSIGN_AGENT',
        entity: 'Order',
        entityId: orderId,
        meta: { agentId, agentName: agent.name }
      }
    });

    return updated;
  }

  async getAllOrders(status?: OrderStatus) {
    return prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: {
            category: true,
            seller: { select: { id: true, name: true, phone: true } },
            images: { take: 1, orderBy: { position: 'asc' } }
          }
        },
        buyer: { select: { id: true, name: true, phone: true } },
        agent: { select: { id: true, name: true, phone: true } },
        inspection: true,
        cash: true
      }
    });
  }

  async getDisputedOrders() {
    return prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.DELIVERY_REFUSED, OrderStatus.INSPECTION_FAILED] }
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        listing: {
          include: {
            seller: { select: { id: true, name: true, phone: true } },
            images: { take: 1, orderBy: { position: 'asc' } }
          }
        },
        buyer: { select: { id: true, name: true, phone: true } },
        agent: { select: { id: true, name: true, phone: true } },
        inspection: { include: { photos: true } }
      }
    });
  }

  async approveReturnToSeller(adminId: string, orderId: string, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: true, agent: true }
    });

    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.status !== OrderStatus.DELIVERY_REFUSED && order.status !== OrderStatus.INSPECTION_FAILED) {
      throw new AppError('Only refused or failed inspection orders can be approved for return.', 400, 'INVALID_STATE');
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'RETURN_APPROVED' as any,
        returnReason: reason,
        history: {
          create: {
            status: 'RETURN_APPROVED' as any,
            actorId: adminId,
            note: `Admin approved return to seller. Reason: ${reason || 'Customer refused delivery'}. Shipper dispatched to return item to seller.`
          }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_APPROVE_RETURN',
        entity: 'Order',
        entityId: orderId,
        meta: { reason }
      }
    });

    return updated;
  }

  async getAuditLogs() {
    return prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } }
      }
    });
  }
}

export const adminService = new AdminService();

