import prisma from '../config/database';
import { TransactionType, DashboardSummary, CategoryBreakdown, MonthlyTrend } from '../types';

export class DashboardService {
  async getSummary(userId: string, userRole: string): Promise<DashboardSummary> {
    const where = userRole === 'ADMIN' ? {} : { userId };

    const byType = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: {
        amount: true,
      },
    });

    const income = byType.find(t => t.type === 'INCOME')?._sum.amount || 0;
    const expense = byType.find(t => t.type === 'EXPENSE')?._sum.amount || 0;

    return {
      totalIncome: Number(income),
      totalExpenses: Number(expense),
      netBalance: Number(income) - Number(expense),
    };
  }

  async getByCategory(userId: string, userRole: string): Promise<CategoryBreakdown[]> {
    const where = userRole === 'ADMIN' ? {} : { userId };

    const results = await prisma.transaction.groupBy({
      by: ['category', 'type'],
      where,
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    return results.map(r => ({
      category: r.category,
      type: r.type as TransactionType,
      total: Number(r._sum.amount),
    }));
  }

  async getTrends(userId: string, userRole: string, months = 6): Promise<MonthlyTrend[]> {
    const where = userRole === 'ADMIN' ? {} : { userId };

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await prisma.transaction.findMany({
      where: {
        ...where,
        date: {
          gte: startDate,
        },
      },
      select: {
        date: true,
        type: true,
        amount: true,
      },
    });

    const monthlyData: Record<string, { income: number; expense: number }> = {};

    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = { income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) {
        if (t.type === 'INCOME') {
          monthlyData[key].income += Number(t.amount);
        } else {
          monthlyData[key].expense += Number(t.amount);
        }
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getRecent(userId: string, userRole: string, limit = 10) {
    const where = userRole === 'ADMIN' ? {} : { userId };

    const transactions = await prisma.transaction.findMany({
      where,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    return transactions.map(t => ({
      id: t.id,
      amount: Number(t.amount),
      type: t.type as TransactionType,
      category: t.category,
      date: t.date,
      description: t.description,
      userName: t.user.name,
    }));
  }
}

export const dashboardService = new DashboardService();
