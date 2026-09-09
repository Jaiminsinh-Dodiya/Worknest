/**
 * WorkNest — Central Dashboard Router
 *
 * Automatically renders the role-appropriate dashboard view based on currentUser.role.
 * Keeps the /dashboard URL working seamlessly across all roles while providing
 * role-tailored statistics, widgets, and actions.
 */

import { useApp } from '../contexts/AppContext';
import { ROLES } from '../config/roles';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import CompanyOwnerDashboard from './dashboards/CompanyOwnerDashboard';
import HRDashboard from './dashboards/HRDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import EmployeeDashboard from './dashboards/EmployeeDashboard';

export default function Dashboard() {
  const { currentUser } = useApp();

  switch (currentUser?.role) {
    case ROLES.SUPER_ADMIN:
      return <SuperAdminDashboard />;
    case ROLES.COMPANY_OWNER:
      return <CompanyOwnerDashboard />;
    case ROLES.HR:
      return <HRDashboard />;
    case ROLES.MANAGER:
      return <ManagerDashboard />;
    case ROLES.EMPLOYEE:
      return <EmployeeDashboard />;
    default:
      return <CompanyOwnerDashboard />;
  }
}
