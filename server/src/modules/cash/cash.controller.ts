import { Request, Response, NextFunction } from 'express';
import { cashService } from './cash.service.js';

export class CashController {
  async getAgentSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await cashService.getAgentCashSummary(req.user!.id);
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  async declareRemittance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cashService.declareRemittance(req.user!.id, req.body.entryIds);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAdminLedger(_req: Request, res: Response, next: NextFunction) {
    try {
      const ledger = await cashService.getAdminLedger();
      res.json({ success: true, data: ledger });
    } catch (error) {
      next(error);
    }
  }

  async confirmRemittance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cashService.confirmRemittance(req.params.id, req.user!.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async releasePayout(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cashService.releasePayout(req.params.id, req.user!.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const cashController = new CashController();

