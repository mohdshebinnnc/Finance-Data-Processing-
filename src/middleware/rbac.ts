import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const authorize = (...allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }

    next();
  };
};

export const requireActive = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (req.user.status === 'INACTIVE') {
    throw ApiError.forbidden('Your account is inactive');
  }

  next();
};

export const canModifyUser = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  const userId = req.params.id;
  
  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (req.user.id === userId) {
    return next();
  }

  throw ApiError.forbidden('You can only modify your own account');
};

export const canDeleteTransaction = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  throw ApiError.forbidden('Only admins can delete transactions');
};
