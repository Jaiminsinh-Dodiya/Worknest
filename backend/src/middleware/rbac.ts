import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

/**
 * Mirroring the frontend PERMISSIONS map from src/config/permissions.js
 */
export const PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: [
    'platform.view',
    'companies.view',
    'companies.manage',
    'users.viewAll',
    'users.manage',
    'projects.viewAll',
    'tasks.viewAll',
    'settings.manage',
  ],
  COMPANY_OWNER: [
    'company.view',
    'users.view',
    'users.manage',
    'projects.view',
    'projects.manage',
    'tasks.view',
    'tasks.manage',
    'ai.access',
  ],
  HR: [
    'users.view',
    'users.manage',
    'ai.access',
  ],
  MANAGER: [
    'projects.view',
    'projects.manage',
    'tasks.view',
    'tasks.manage',
    'team.view',
    'ai.access',
  ],
  EMPLOYEE: [
    'tasks.viewOwn',
    'tasks.updateOwn',
    'projects.viewOwn',
    'ai.access',
  ],
};

/**
 * Check if a role possesses a specific permission string
 */
export function hasPermission(role: Role, permission: string): boolean {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;
  return rolePermissions.includes(permission);
}

/**
 * Middleware: Requires user to have at least one of the specified roles
 */
export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Access denied: requires role ${roles.join(' or ')}`);
    }

    next();
  };
};

/**
 * Middleware: Requires user's role to have a specific permission
 */
export const requirePermission = (permission: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!hasPermission(req.user.role, permission)) {
      throw new ForbiddenError(`Access denied: missing permission '${permission}'`);
    }

    next();
  };
};
