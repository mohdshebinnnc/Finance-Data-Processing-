import { Router, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get(
  '/summary',
  authenticate,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const summary = await dashboardService.getSummary(req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/by-category',
  authenticate,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const categories = await dashboardService.getByCategory(req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/trends',
  authenticate,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const trends = await dashboardService.getTrends(req.user.id, req.user.role, months);
      res.status(200).json({
        success: true,
        data: trends,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/recent',
  authenticate,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recent = await dashboardService.getRecent(req.user.id, req.user.role, limit);
      res.status(200).json({
        success: true,
        data: recent,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
