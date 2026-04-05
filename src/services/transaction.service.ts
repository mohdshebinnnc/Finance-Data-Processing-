import prisma from '../config/database';
import { TransactionType, CreateTransactionDto, UpdateTransactionDto, TransactionFilters, PaginatedResponse } from '../types';
import { ApiError } from '../utils/ApiError';

export class TransactionService {
  async create(data: CreateTransactionDto, userId: string) {
    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type as any,
        category: data.category,
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description,
        userId,
      },
    });

    return this.formatTransaction(transaction);
  }

  async findAll(filters: TransactionFilters, userId: string, userRole: string): Promise<PaginatedResponse<any>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder || 'desc';
    
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userRole === 'VIEWER' || userRole === 'ANALYST') {
      where.userId = userId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.fromDate || filters.toDate) {
      where.date = {};
      if (filters.fromDate) {
        where.date.gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        where.date.lte = new Date(filters.toDate);
      }
    }

    if (filters.minAmount || filters.maxAmount) {
      where.amount = {};
      if (filters.minAmount) {
        where.amount.gte = filters.minAmount;
      }
      if (filters.maxAmount) {
        where.amount.lte = filters.maxAmount;
      }
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions.map(t => this.formatTransaction(t)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string, userRole: string) {
    const where: any = { id };

    if (userRole === 'VIEWER' || userRole === 'ANALYST') {
      where.userId = userId;
    }

    const transaction = await prisma.transaction.findFirst({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }

    return this.formatTransaction(transaction);
  }

  async update(id: string, data: UpdateTransactionDto, userId: string, userRole: string) {
    const where: any = { id };

    if (userRole === 'VIEWER' || userRole === 'ANALYST') {
      where.userId = userId;
    }

    const existing = await prisma.transaction.findFirst({ where });

    if (!existing) {
      throw ApiError.notFound('Transaction not found');
    }

    const updateData: any = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.description !== undefined) updateData.description = data.description;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return this.formatTransaction(transaction);
  }

  async delete(id: string, userId: string, userRole: string) {
    const where: any = { id };

    if (userRole === 'VIEWER' || userRole === 'ANALYST') {
      where.userId = userId;
    }

    const existing = await prisma.transaction.findFirst({ where });

    if (!existing) {
      throw ApiError.notFound('Transaction not found');
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return { message: 'Transaction deleted successfully' };
  }

  async getCategories(): Promise<string[]> {
    const categories = await prisma.transaction.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return categories.map(c => c.category);
  }

  private formatTransaction(transaction: any) {
    return {
      id: transaction.id,
      amount: Number(transaction.amount),
      type: transaction.type as TransactionType,
      category: transaction.category,
      date: transaction.date,
      description: transaction.description,
      userId: transaction.userId,
      user: transaction.user,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}

export const transactionService = new TransactionService();
