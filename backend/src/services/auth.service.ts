import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { env } from '../config/env.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { TokenPayload, AuthUser } from '../types/index.js';

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  static async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            plan: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (user.status === 'Inactive') {
      throw new UnauthorizedError('Your account has been deactivated. Contact your administrator.');
    }

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    });

    // Sanitize user (exclude password hash)
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh expired access token using valid refresh token
   */
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.status === 'Inactive') {
        throw new UnauthorizedError('User not found or account is inactive');
      }

      const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      };

      const newAccessToken = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
      });

      return {
        success: true,
        accessToken: newAccessToken,
      };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Get user profile by ID
   */
  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Fetch active demo accounts from PostgreSQL database for development & evaluation
   */
  static async getDemoAccounts() {
    const DEMO_MAP: Record<string, { label: string; defaultPassword: string; description: string }> = {
      'admin@worknest.local': { label: 'Super Admin', defaultPassword: 'admin123', description: 'Platform Administrator' },
      'owner@worknest.local': { label: 'Company Owner', defaultPassword: 'owner123', description: 'WorkNest Technologies' },
      'hr@worknest.local': { label: 'HR Lead', defaultPassword: 'hr123', description: 'Human Resources' },
      'manager@worknest.local': { label: 'Dev Manager', defaultPassword: 'manager123', description: 'Development Department' },
      'anita@worknest.local': { label: 'Design Manager', defaultPassword: 'anita123', description: 'Design Department' },
      'employee@worknest.local': { label: 'Dev Employee', defaultPassword: 'employee123', description: 'Development Team' },
      'amit@worknest.local': { label: 'Design Employee', defaultPassword: 'amit123', description: 'Design Team' },
      'ravi@technova.local': { label: 'Tenant 2 Owner', defaultPassword: 'ravi123', description: 'TechNova Solutions' },
    };

    const demoEmails = Object.keys(DEMO_MAP);

    const users = await prisma.user.findMany({
      where: {
        email: { in: demoEmails },
        status: 'Active',
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const roleOrder: Record<string, number> = {
      SUPER_ADMIN: 1,
      COMPANY_OWNER: 2,
      HR: 3,
      MANAGER: 4,
      EMPLOYEE: 5,
    };

    return users
      .map((u) => {
        const meta = DEMO_MAP[u.email];
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          password: meta?.defaultPassword || 'worknest123',
          role: u.role,
          label: meta?.label || u.name,
          description: meta?.description || u.department,
          department: u.department,
          companyName: u.company?.name || 'Platform Level',
        };
      })
      .sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));
  }
}
