import { Request, Response, NextFunction } from 'express';
import { listingsService } from './listings.service.js';
import { getFileUrl } from '../../lib/storage.js';
import { AppError } from '../../middleware/errorHandler.js';

export class ListingsController {
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await listingsService.getCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await listingsService.getCategoryBySlug(req.params.slug);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async queryListings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await listingsService.queryListings(req.query as any);
      res.json({ success: true, data: result.items, meta: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getListingById(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await listingsService.getListingById(req.params.id);
      res.json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  }

  async createListing(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await listingsService.createListing(req.user!.id, req.body);
      res.status(201).json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  }

  async updateListing(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await listingsService.updateListing(
        req.user!.id,
        req.user!.role,
        req.params.id,
        req.body
      );
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async getMyListings(req: Request, res: Response, next: NextFunction) {
    try {
      const listings = await listingsService.getMyListings(req.user!.id);
      res.json({ success: true, data: listings });
    } catch (error) {
      next(error);
    }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No image file uploaded.', 400, 'FILE_MISSING');
      }
      const url = getFileUrl(req.file.filename);
      res.status(201).json({
        success: true,
        data: { url, filename: req.file.filename, size: req.file.size }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const listingsController = new ListingsController();

