import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service.js';

export class AdminController {
  async getDashboardStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getPendingListings(_req: Request, res: Response, next: NextFunction) {
    try {
      const listings = await adminService.getPendingListings();
      res.json({ success: true, data: listings });
    } catch (error) {
      next(error);
    }
  }

  async approveListing(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await adminService.approveListing(req.user!.id, req.params.id);
      res.json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  }

  async rejectListing(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await adminService.rejectListing(
        req.user!.id,
        req.params.id,
        req.body.reason || 'Rejected by platform moderation'
      );
      res.json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminService.getUsers(req.query.role as any);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminService.updateUserStatus(
        req.user!.id,
        req.params.id,
        req.body.status
      );
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async inviteAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.inviteAgent(req.user!.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async assignAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await adminService.assignAgentToOrder(
        req.user!.id,
        req.params.id,
        req.body.agentId
      );
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await adminService.getAllOrders(req.query.status as any);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async getDisputes(_req: Request, res: Response, next: NextFunction) {
    try {
      const disputes = await adminService.getDisputedOrders();
      res.json({ success: true, data: disputes });
    } catch (error) {
      next(error);
    }
  }

  async approveReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await adminService.approveReturnToSeller(
        req.user!.id,
        req.params.id,
        req.body.reason
      );
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(_req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await adminService.getAuditLogs();
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();

