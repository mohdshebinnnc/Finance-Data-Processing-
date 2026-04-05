import { Router, Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate, createTransactionSchema, updateTransactionSchema, transactionFiltersSchema } from '../utils/validator';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('ANALYST', 'ADMIN'),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const data = validate(createTransactionSchema, req.body);
      const transaction = await transactionService.create(data, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/',
  authenticate,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const filters = validate(transactionFiltersSchema, req.query);
      const result = await transactionService.findAll(filters, req.user.id, req.user.role);
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
  '/categories',
  authenticate,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const categories = await transactionService.getCategories();
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
  '/:id',
  authenticate,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const transaction = await transactionService.findById(req.params.id, req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  authorize('ANALYST', 'ADMIN'),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const data = validate(updateTransactionSchema, req.body);
      const transaction = await transactionService.update(req.params.id, data, req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        data: transaction,
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
      await transactionService.delete(req.params.id, req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
