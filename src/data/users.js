import { ROLES } from '../config/roles';

/**
 * WorkNest — Mock User Database
 *
 * All users in one flat array with passwords (development-only).
 * Passwords are plaintext for mock purposes — DO NOT use in production.
 *
 * Each user has a companyId for multi-tenant data isolation:
 *   - SUPER_ADMIN: companyId = null (platform-level)
 *   - All others: companyId = 'company-1' (or other company)
 */

export const mockUsers = [
  // ── Super Admin (Platform Level) ──
  {
    id: 'super-admin-1',
    name: 'Super Admin',
    email: 'admin@worknest.local',
    password: 'admin123',
    phone: '+91 90000 00000',
    role: ROLES.SUPER_ADMIN,
    department: 'Platform',
    companyId: null,
    status: 'Active',
    avatar: null,
    joinedAt: '2024-01-01',
  },

  // ── Company 1: WorkNest Technologies ──
  {
    id: 'user-1',
    name: 'Jaimin Dodiya',
    email: 'owner@worknest.local',
    password: 'owner123',
    phone: '+91 98765 43210',
    role: ROLES.COMPANY_OWNER,
    department: 'Management',
    companyId: 'company-1',
    status: 'Active',
    avatar: null,
    joinedAt: '2024-01-15',
  },
  {
    id: 'user-2',
    name: 'Priya Shah',
    email: 'hr@worknest.local',
    password: 'hr123',
    phone: '+91 98765 43211',
    role: ROLES.HR,
    department: 'Human Resources',
    companyId: 'company-1',
    status: 'Active',
    avatar: null,
    joinedAt: '2024-02-10',
  },
  {
    id: 'user-3',
    name: 'Rahul Kumar',
    email: 'manager@worknest.local',
    password: 'manager123',
    phone: '+91 98765 43212',
    role: ROLES.MANAGER,
    department: 'Development',
    companyId: 'company-1',
    status: 'Active',
    avatar: null,
    joinedAt: '2024-02-15',
  },
  {
    id: 'user-4',
    name: 'Anita Mehta',
    email: 'anita@worknest.local',
    password: 'anita123',
    phone: '+91 98765 43213',
    role: ROLES.MANAGER,
    department: 'Design',
    companyId: 'company-1',
    status: 'Active',
    avatar: null,
    joinedAt: '2024-03-01',
  },
  {
    id: 'user-5',
    name: 'Vikram Patel',
    email: 'employee@worknest.local',
    password: 'employee123',
    phone: '+91 98765 43214',
    role: ROLES.EMPLOYEE,
    department: 'Development',
    companyId: 'company-1',
    status: 'Active',
    avatar: null,
    joinedAt: '2024-03-10',
  },
  {
    id: 'user-6',
    name: 'Sneha Reddy',
    email: 'sneha@worknest.local',
    password: 'sneha123',
    phone: '+91 98765 43215',
    role: ROLES.EMPLOYEE,
    department: 'Development',
    companyId: 'company-1',
    status: 'Active',
    avatar: null,
    joinedAt: '2024-04-01',
  },
  {
    id: 'user-7',
    name: 'Amit Sharma',
    email: 'amit@worknest.local',
    password: 'amit123',
    phone: '+91 98765 43216',
    role: ROLES.EMPLOYEE,
    department: 'Design',
    companyId: 'company-1',
    status: 'Active',
    avatar: null,
    joinedAt: '2024-04-15',
  },
  {
    id: 'user-8',
    name: 'Deepa Nair',
    email: 'deepa@worknest.local',
    password: 'deepa123',
    phone: '+91 98765 43217',
    role: ROLES.EMPLOYEE,
    department: 'Quality Assurance',
    companyId: 'company-1',
    status: 'Active',
    avatar: null,
    joinedAt: '2024-05-01',
  },
  {
    id: 'user-9',
    name: 'Karan Joshi',
    email: 'karan@worknest.local',
    password: 'karan123',
    phone: '+91 98765 43218',
    role: ROLES.EMPLOYEE,
    department: 'Development',
    companyId: 'company-1',
    status: 'Inactive',
    avatar: null,
    joinedAt: '2024-05-15',
  },

  // ── Company 2: TechNova Solutions (for Super Admin multi-company demo) ──
  {
    id: 'user-10',
    name: 'Ravi Desai',
    email: 'ravi@technova.local',
    password: 'ravi123',
    phone: '+91 91234 56789',
    role: ROLES.COMPANY_OWNER,
    department: 'Management',
    companyId: 'company-2',
    status: 'Active',
    avatar: null,
    joinedAt: '2024-06-01',
  },
  {
    id: 'user-11',
    name: 'Meera Kapoor',
    email: 'meera@technova.local',
    password: 'meera123',
    phone: '+91 91234 56790',
    role: ROLES.EMPLOYEE,
    department: 'Development',
    companyId: 'company-2',
    status: 'Active',
    avatar: null,
    joinedAt: '2024-06-15',
  },
];

/** All available roles */
export const roles = Object.values(ROLES);

/** All departments */
export const departments = ['Management', 'Human Resources', 'Development', 'Design', 'Quality Assurance', 'Platform'];

/**
 * Demo accounts for the Login screen selector.
 * Does NOT include passwords in an exported array — passwords are only in mockUsers above.
 */
export const demoAccounts = [
  { email: 'admin@worknest.local', password: 'admin123', role: ROLES.SUPER_ADMIN, label: 'Super Admin' },
  { email: 'owner@worknest.local', password: 'owner123', role: ROLES.COMPANY_OWNER, label: 'Company Owner' },
  { email: 'hr@worknest.local', password: 'hr123', role: ROLES.HR, label: 'HR' },
  { email: 'manager@worknest.local', password: 'manager123', role: ROLES.MANAGER, label: 'Manager' },
  { email: 'employee@worknest.local', password: 'employee123', role: ROLES.EMPLOYEE, label: 'Employee' },
];
