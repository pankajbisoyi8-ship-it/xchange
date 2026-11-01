import { Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service.js';

export class OrdersController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.createOrder(req.user!.id, req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await ordersService.getMyOrders(req.user!.id);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.getOrderById(req.params.id, req.user!);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const cancelled = await ordersService.cancelOrder(
        req.params.id,
        req.user!,
        req.body.reason || 'Cancelled by user'
      );
      res.json({ success: true, data: cancelled });
    } catch (error) {
      next(error);
    }
  }
}

export const ordersController = new OrdersController();

