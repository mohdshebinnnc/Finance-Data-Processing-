import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required').max(50),
  date: z.string().datetime().optional(),
  description: z.string().max(500).optional(),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().min(1).max(50).optional(),
  date: z.string().datetime().optional(),
  description: z.string().max(500).optional(),
});

export const transactionFiltersSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export function validateAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  return schema.parseAsync(data);
}
