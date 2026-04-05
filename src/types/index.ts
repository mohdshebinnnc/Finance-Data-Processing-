import { Request } from 'express';

export type Role = 'VIEWER' | 'ANALYST' | 'ADMIN';

export type TransactionType = 'INCOME' | 'EXPENSE';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

export interface CategoryBreakdown {
  category: string;
  type: TransactionType;
  total: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface UpdateUserDto {
  name?: string;
  role?: Role;
  status?: UserStatus;
}

export interface CreateTransactionDto {
  amount: number;
  type: TransactionType;
  category: string;
  date?: string;
  description?: string;
}

export interface UpdateTransactionDto {
  amount?: number;
  type?: TransactionType;
  category?: string;
  date?: string;
  description?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}
