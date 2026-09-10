import bcrypt from 'bcrypt';
import { Role, UserStatus } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';
import { TokenPayload } from '../types/index.js';

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: Role;
  department: string;
  companyId?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: Role;
  avatar?: string;
}

export class UserService {
  /**
   * Get list of users scoped by caller's role and company
   */
  static async getUsers(user: TokenPayload) {
    if (user.role === 'SUPER_ADMIN') {
      return prisma.user.findMany({
        where: {
          id: { not: user.userId },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          department: true,
          companyId: true,
          status: true,
          avatar: true,
          joinedAt: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });
    }

    // Company-level scoping
    if (!user.companyId) {
      throw new ForbiddenError('User has no company association');
    }

    return prisma.user.findMany({
      where: {
        companyId: user.companyId,
        id: { not: user.userId },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        companyId: true,
        status: true,
        avatar: true,
        joinedAt: true,
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  /**
   * Get single user by ID with tenant checks
   */
  static async getUserById(targetId: string, user: TokenPayload) {
    const foundUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        companyId: true,
        status: true,
        avatar: true,
        joinedAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!foundUser) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== 'SUPER_ADMIN' && foundUser.companyId !== user.companyId) {
      throw new ForbiddenError('Access denied to other company user');
    }

    return foundUser;
  }

  /**
   * Create a new user with bcrypt password hashing
   */
  static async createUser(data: CreateUserDTO, creator: TokenPayload) {
    // Determine companyId
    let targetCompanyId: string | null = null;
    if (creator.role === 'SUPER_ADMIN') {
      targetCompanyId = data.companyId || null;
    } else {
      targetCompanyId = creator.companyId;
      if (data.role === 'SUPER_ADMIN') {
        throw new ForbiddenError('Only Super Admins can create another Super Admin');
      }
    }

    const normalizedEmail = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new BadRequestError('User with this email already exists');
    }

    const rawPassword = data.password || 'worknest123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const created = await prisma.user.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: data.phone,
        role: data.role,
        department: data.department,
        companyId: targetCompanyId,
        status: 'Active',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        companyId: true,
        status: true,
        avatar: true,
        joinedAt: true,
      },
    });

    return created;
  }

  /**
   * Update user details
   */
  static async updateUser(targetId: string, data: UpdateUserDTO, modifier: TokenPayload) {
    const existing = await prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!existing) {
      throw new NotFoundError('User not found');
    }

    // Tenant check
    if (modifier.role !== 'SUPER_ADMIN' && existing.companyId !== modifier.companyId) {
      throw new ForbiddenError('Cannot update users outside your company');
    }

    // Role modification restrictions
    if (data.role && modifier.role !== 'SUPER_ADMIN' && modifier.role !== 'COMPANY_OWNER') {
      throw new ForbiddenError('Insufficient permissions to change user role');
    }

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: {
        name: data.name,
        email: data.email ? data.email.toLowerCase().trim() : undefined,
        phone: data.phone,
        department: data.department,
        role: data.role,
        avatar: data.avatar,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        companyId: true,
        status: true,
        avatar: true,
        joinedAt: true,
      },
    });

    return updated;
  }

  /**
   * Toggle user active/inactive status
   */
  static async toggleUserStatus(targetId: string, modifier: TokenPayload) {
    const existing = await prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!existing) {
      throw new NotFoundError('User not found');
    }

    if (modifier.role !== 'SUPER_ADMIN' && existing.companyId !== modifier.companyId) {
      throw new ForbiddenError('Cannot modify status of users outside your company');
    }

    if (existing.id === modifier.userId) {
      throw new BadRequestError('Cannot deactivate your own account');
    }

    const newStatus: UserStatus = existing.status === 'Active' ? 'Inactive' : 'Active';

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: { status: newStatus },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    return updated;
  }
}
