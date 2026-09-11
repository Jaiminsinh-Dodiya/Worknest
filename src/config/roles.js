/**
 * WorkNest — Canonical Role Constants & Metadata
 *
 * Single source of truth for all role identifiers used across the application.
 * These strings will match the future database/backend role values exactly.
 */

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_OWNER: 'COMPANY_OWNER',
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

/** Human-readable role labels for display in UI */
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.COMPANY_OWNER]: 'Company Owner',
  [ROLES.HR]: 'HR',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.EMPLOYEE]: 'Employee',
};

/** Dashboard landing path for each role after login */
export const ROLE_DASHBOARD_PATHS = {
  [ROLES.SUPER_ADMIN]: '/admin',
  [ROLES.COMPANY_OWNER]: '/dashboard',
  [ROLES.HR]: '/hr',
  [ROLES.MANAGER]: '/manager',
  [ROLES.EMPLOYEE]: '/employee',
};

/** Get the dashboard path for a given role */
export function getDashboardPath(role) {
  return ROLE_DASHBOARD_PATHS[role] || '/dashboard';
}

/** All available role values as an array */
export const ALL_ROLES = Object.values(ROLES);

/** Company-level roles (excludes SUPER_ADMIN who operates at platform level) */
export const COMPANY_ROLES = [ROLES.COMPANY_OWNER, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE];
