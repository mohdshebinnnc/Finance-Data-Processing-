import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError';

export const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new ApiError(429, 'Too many requests, please try again later');
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again after 15 minutes',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again after 15 minutes',
    });
  },
});

export const createTransactionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new ApiError(429, 'Too many requests, please try again later');
  },
});
