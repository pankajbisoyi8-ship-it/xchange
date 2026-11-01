import { CashStatus, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class CashService {
  async getAgentCashSummary(agentId: string) {
    const entries = await prisma.cashEntry.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            totalToCollect: true,
            itemPrice: true,
            deliveryFee: true,
            commission: true,
            listing: { select: { title: true } },
            buyer: { select: { name: true } }
          }
        }
      }
    });

    const cashInHandEntries = entries.filter(e => e.status === CashStatus.WITH_AGENT);
    const cashInHand = cashInHandEntries.reduce((sum, e) => sum + Number(e.amount), 0);
    const remittedTotal = entries
      .filter(e => e.status === CashStatus.REMITTED || e.status === CashStatus.PAYOUT_RELEASED)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      cashInHand,
      remittedTotal,
      activeEntriesCount: cashInHandEntries.length,
      history: entries
    };
  }

  async declareRemittance(agentId: string, entryIds: string[]) {
    // Agent flags entries that they have physically handed in or deposited
    const updated = await prisma.cashEntry.updateMany({
      where: {
        id: { in: entryIds },
        agentId,
        status: CashStatus.WITH_AGENT
      },
      data: {
        remittedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: agentId,
        action: 'AGENT_DECLARE_REMITTANCE',
        entity: 'CashEntry',
        entityId: entryIds.join(','),
        meta: { count: updated.count }
      }
    });

    return { message: 'Remittance declaration submitted for admin verification.', updatedCount: updated.count };
  }

  async getAdminLedger() {
    const entries = await prisma.cashEntry.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            listing: {
              include: {
                seller: { select: { id: true, name: true, phone: true } }
              }
            },
            buyer: { select: { id: true, name: true, phone: true } }
          }
        }
      }
    });

    // Check for entries holding cash > 24 hours
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const enriched = entries.map(entry => {
      const isOverdue = entry.status === CashStatus.WITH_AGENT && entry.createdAt < twentyFourHoursAgo;
      return {
        ...entry,
        isOverdue
      };
    });

    const totalWithAgents = entries
      .filter(e => e.status === CashStatus.WITH_AGENT)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalRemitted = entries
      .filter(e => e.status === CashStatus.REMITTED || e.status === CashStatus.PAYOUT_RELEASED)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalPendingPayout = entries
      .filter(e => e.status === CashStatus.REMITTED)
      .reduce((sum, e) => sum + Number(e.sellerPayout), 0);

    return {
      metrics: {
        totalWithAgents,
        totalRemitted,
        totalPendingPayout,
        overdueCount: enriched.filter(e => e.isOverdue).length
      },
      entries: enriched
    };
  }

  async confirmRemittance(cashEntryId: string, adminId: string) {
    const entry = await prisma.cashEntry.findUnique({ where: { id: cashEntryId } });
    if (!entry) throw new AppError('Cash entry not found', 404, 'NOT_FOUND');

    const updated = await prisma.cashEntry.update({
      where: { id: cashEntryId },
      data: {
        status: CashStatus.REMITTED,
        remittedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_CONFIRM_REMITTANCE',
        entity: 'CashEntry',
        entityId: cashEntryId,
        meta: { amount: entry.amount }
      }
    });

    return updated;
  }

  async releasePayout(cashEntryId: string, adminId: string) {
    const entry = await prisma.cashEntry.findUnique({
      where: { id: cashEntryId },
      include: {
        order: {
          include: {
            listing: { select: { sellerId: true } }
          }
        }
      }
    });

    if (!entry) throw new AppError('Cash entry not found', 404, 'NOT_FOUND');
    if (entry.status !== CashStatus.REMITTED) {
      throw new AppError('Cannot release payout before agent remittance is confirmed.', 400, 'NOT_REMITTED');
    }

    const updated = await prisma.cashEntry.update({
      where: { id: cashEntryId },
      data: {
        status: CashStatus.PAYOUT_RELEASED,
        payoutAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_RELEASE_PAYOUT',
        entity: 'CashEntry',
        entityId: cashEntryId,
        meta: {
          sellerId: entry.order.listing.sellerId,
          sellerPayout: entry.sellerPayout
        }
      }
    });

    return updated;
  }
}

export const cashService = new CashService();

