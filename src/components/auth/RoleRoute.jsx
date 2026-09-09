/**
 * WorkNest — Role-Based Route Protection Component
 *
 * Wraps route content and enforces role-based access control:
 *  1. If not authenticated → redirect to /login
 *  2. If role not in allowedRoles → redirect to user's dashboard
 *  3. Otherwise → render children
 */

import { Navigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getDashboardPath } from '../../config/roles';

export default function RoleRoute({ allowedRoles, children }) {
  const { currentUser, isAuthenticated } = useApp();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getDashboardPath(currentUser.role)} replace />;
  }

  return children;
}
