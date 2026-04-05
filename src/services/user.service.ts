import prisma from '../config/database';
import { Role, UserStatus, UpdateUserDto, PaginatedResponse } from '../types';
import { ApiError } from '../utils/ApiError';

export class UserService {
  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return {
      data: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as Role,
        status: u.status as UserStatus,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      status: user.status as UserStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(id: string, data: UpdateUserDto) {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw ApiError.notFound('User not found');
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        status: data.status,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      status: user.status as UserStatus,
      updatedAt: user.updatedAt,
    };
  }

  async updateRole(id: string, role: Role) {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      updatedAt: user.updatedAt,
    };
  }

  async updateStatus(id: string, status: UserStatus) {
    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        updatedAt: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status as UserStatus,
      updatedAt: user.updatedAt,
    };
  }

  async delete(id: string) {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw ApiError.notFound('User not found');
    }

    await prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}

export const userService = new UserService();
