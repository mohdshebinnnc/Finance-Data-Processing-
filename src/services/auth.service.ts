import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { LoginDto, RegisterDto, Role, UserStatus, AuthUser, TokenPayload } from '../types';
import { ApiError } from '../utils/ApiError';

export class AuthService {
  async register(data: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'VIEWER',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      status: user.status as UserStatus,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        status: user.status as UserStatus,
      },
      token,
    };
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (user.status === 'INACTIVE') {
      throw ApiError.forbidden('Account is inactive');
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      status: user.status as UserStatus,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        status: user.status as UserStatus,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

  private generateToken(user: AuthUser): string {
    const secret = process.env.JWT_SECRET || 'default-secret';

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, secret);
  }
}

export const authService = new AuthService();
