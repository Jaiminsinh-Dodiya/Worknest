import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import RoleRoute from './components/auth/RoleRoute';
import { ROLES } from './config/roles';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import MyTasks from './pages/MyTasks';

// Role Dashboards (alias routes)
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import HRDashboard from './pages/dashboards/HRDashboard';
import ManagerDashboard from './pages/dashboards/ManagerDashboard';
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard';

// Admin Pages
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminUsers from './pages/admin/AdminUsers';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AppShell />}>
        {/* Central Dashboard (works for all roles, renders role-appropriate dashboard) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Role-Specific Dashboard Aliases */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <SuperAdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/hr"
          element={
            <RoleRoute allowedRoles={[ROLES.HR]}>
              <HRDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER]}>
              <ManagerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <RoleRoute allowedRoles={[ROLES.EMPLOYEE]}>
              <EmployeeDashboard />
            </RoleRoute>
          }
        />

        {/* Super Admin Tenant & User Management */}
        <Route
          path="/admin/companies"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <AdminCompanies />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <AdminUsers />
            </RoleRoute>
          }
        />

        {/* Organization Pages */}
        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER, ROLES.HR, ROLES.MANAGER]}>
              <Users />
            </RoleRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER, ROLES.MANAGER, ROLES.EMPLOYEE]}>
              <Projects />
            </RoleRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER, ROLES.MANAGER, ROLES.EMPLOYEE]}>
              <ProjectDetails />
            </RoleRoute>
          }
        />

        {/* Tasks Pages */}
        <Route
          path="/my-tasks"
          element={
            <RoleRoute allowedRoles={[ROLES.MANAGER, ROLES.EMPLOYEE]}>
              <MyTasks />
            </RoleRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER, ROLES.MANAGER]}>
              <MyTasks />
            </RoleRoute>
          }
        />

        {/* Shared Pages */}
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
