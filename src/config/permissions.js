/**
 * WorkNest — Centralized Permission System
 *
 * Maps each role to a set of permission strings.
 * Keeps role logic centralized instead of scattering if/else checks everywhere.
 */

import { ROLES, getDashboardPath } from './roles';

/** Permission strings grouped by role */
export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    'platform.view',
    'companies.view',
    'companies.manage',
    'users.viewAll',
    'users.manage',
    'projects.viewAll',
    'tasks.viewAll',
    'settings.manage',
  ],
  [ROLES.COMPANY_OWNER]: [
    'company.view',
    'users.view',
    'users.manage',
    'projects.view',
    'projects.manage',
    'tasks.view',
    'tasks.manage',
    'ai.access',
  ],
  [ROLES.HR]: [
    'users.view',
    'users.manage',
    'ai.access',
  ],
  [ROLES.MANAGER]: [
    'projects.view',
    'projects.manage',
    'tasks.view',
    'tasks.manage',
    'team.view',
    'ai.access',
  ],
  [ROLES.EMPLOYEE]: [
    'tasks.viewOwn',
    'tasks.updateOwn',
    'projects.viewOwn',
    'ai.access',
  ],
};

/**
 * Check if a role has a specific permission.
 * @param {string} role - User role string
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;
  return rolePermissions.includes(permission);
}

/**
 * Check if a user's role is included in a list of allowed roles.
 * @param {string} userRole - Current user's role
 * @param {string[]} allowedRoles - Array of permitted roles
 * @returns {boolean}
 */
export function hasRole(userRole, allowedRoles) {
  return allowedRoles.includes(userRole);
}

/**
 * Determine which path a user should be redirected to if they lack access.
 * @param {string} role - Current user's role
 * @returns {string} - Redirect path
 */
export function getRedirectPath(role) {
  return getDashboardPath(role);
}
