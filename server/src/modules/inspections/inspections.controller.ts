import { Request, Response, NextFunction } from 'express';
import { inspectionsService } from './inspections.service.js';

export class InspectionsController {
  async getMyTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await inspectionsService.getAgentTasks(req.user!.id);
      res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  async schedulePickup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inspectionsService.schedulePickup(
        req.params.id,
        req.user!.id,
        req.body.notes
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async markPickedUp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inspectionsService.markPickedUp(
        req.params.id,
        req.user!.id,
        req.body.notes
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async submitInspection(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inspectionsService.submitInspection(
        req.user!.id,
        req.params.id,
        req.body
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async markOutForDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inspectionsService.markOutForDelivery(
        req.params.id,
        req.user!.id
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async deliverOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inspectionsService.deliverOrder(
        req.params.id,
        req.user!.id,
        req.body.otp
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refuseDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inspectionsService.refuseDelivery(
        req.params.id,
        req.user!.id,
        req.body.reason
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await inspectionsService.getAvailableOrdersToClaim(req.user!.id);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async claimOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await inspectionsService.claimOrder(req.params.id, req.user!.id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async pickupReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inspectionsService.pickupReturnFromCustomer(
        req.params.id,
        req.user!.id,
        req.body.notes
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async completeReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inspectionsService.completeReturnToSeller(
        req.params.id,
        req.user!.id,
        req.body.notes
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const inspectionsController = new InspectionsController();

