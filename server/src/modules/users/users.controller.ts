import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service.js';

export class UsersController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await usersService.getProfile(req.user!.id);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await usersService.updateProfile(req.user!.id, req.body);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const addresses = await usersService.getAddresses(req.user!.id);
      res.json({ success: true, data: addresses });
    } catch (error) {
      next(error);
    }
  }

  async addAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const address = await usersService.addAddress(req.user!.id, req.body);
      res.status(201).json({ success: true, data: address });
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.deleteAddress(req.user!.id, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();

