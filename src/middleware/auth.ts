import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, TokenPayload } from '../types';
import { ApiError } from '../utils/ApiError';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('No token provided'));
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'default-secret';
  
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: '',
      role: decoded.role,
      status: 'ACTIVE' as const,
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(ApiError.unauthorized('Token expired'));
    } else {
      next(ApiError.unauthorized('Authentication failed'));
    }
  }
};
