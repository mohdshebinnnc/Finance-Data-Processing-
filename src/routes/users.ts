import { Router, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { authenticate } from '../middleware/auth';
import { authorize, canModifyUser } from '../middleware/rbac';
import { validate, paginationSchema, updateUserSchema } from '../utils/validator';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = validate(paginationSchema, {
        page: req.query.page,
        limit: req.query.limit,
      });
      const result = await userService.getAll(page, limit);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  authenticate,
  canModifyUser,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const data = validate(updateUserSchema, req.body);
      const user = await userService.update(req.params.id, data);
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/role',
  authenticate,
  authorize('ADMIN'),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { role } = req.body;
      if (!role || !['VIEWER', 'ANALYST', 'ADMIN'].includes(role)) {
        throw new Error('Invalid role');
      }
      const user = await userService.updateRole(req.params.id, role);
      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
        throw new Error('Invalid status');
      }
      const user = await userService.updateStatus(req.params.id, status);
      res.status(200).json({
        success: true,
        message: 'User status updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      await userService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
