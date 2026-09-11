/**
 * WorkNest — Role-Based Sidebar Navigation Configuration
 *
 * Single source of truth for sidebar nav items per role.
 * The Sidebar component reads this config and renders dynamically.
 */

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Bot,
  UserCircle,
  Settings,
  Building2,
  ClipboardList,
  CheckSquare,
} from 'lucide-react';
import { ROLES } from './roles';

export const navigationByRole = {
  [ROLES.SUPER_ADMIN]: {
    sectionLabel: 'WORKNEST',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/companies', label: 'Companies', icon: Building2 },
      { to: '/admin/users', label: 'Platform Users', icon: Users },
    ],
  },
  [ROLES.COMPANY_OWNER]: {
    sectionLabel: 'COMPANY',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/users', label: 'Users', icon: Users },
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/tasks', label: 'All Tasks', icon: ClipboardList },
      { to: '/ai', label: 'AI Assistant', icon: Bot },
    ],
  },
  [ROLES.HR]: {
    sectionLabel: 'HR',
    items: [
      { to: '/hr', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/users', label: 'Users', icon: Users },
      { to: '/ai', label: 'AI Assistant', icon: Bot },
    ],
  },
  [ROLES.MANAGER]: {
    sectionLabel: 'WORKSPACE',
    items: [
      { to: '/manager', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
      { to: '/tasks', label: 'Team Tasks', icon: ClipboardList },
      { to: '/ai', label: 'AI Assistant', icon: Bot },
    ],
  },
  [ROLES.EMPLOYEE]: {
    sectionLabel: 'MY WORKSPACE',
    items: [
      { to: '/employee', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
      { to: '/projects', label: 'My Projects', icon: FolderKanban },
      { to: '/ai', label: 'AI Assistant', icon: Bot },
    ],
  },
};

/** Account section nav — shared across all roles */
export const accountNav = [
  { to: '/profile', label: 'Profile', icon: UserCircle, end: true },
  { to: '/settings', label: 'Settings', icon: Settings, end: true },
];
