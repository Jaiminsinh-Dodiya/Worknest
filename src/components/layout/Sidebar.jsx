import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  Shield,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { navigationByRole, accountNav } from '../../config/navigation';
import { ROLE_LABELS, ROLES, getDashboardPath } from '../../config/roles';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const { currentUser, company, logout } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed);
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-200'
    } ${collapsed ? 'justify-center px-2' : ''}`;

  const currentRole = currentUser?.role || ROLES.COMPANY_OWNER;
  const roleNav = navigationByRole[currentRole] || navigationByRole[ROLES.COMPANY_OWNER];
  const isSuperAdmin = currentRole === ROLES.SUPER_ADMIN;

  return (
    <aside
      className={`flex flex-col h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 flex-shrink-0 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      {/* Logo / Company Context */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => navigate(getDashboardPath(currentRole))}
          className="flex items-center gap-2.5 w-full text-left cursor-pointer"
          title="Go to Dashboard"
        >
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">WorkNest</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                {isSuperAdmin ? <Shield size={10} className="text-primary-500" /> : <Building2 size={10} />}
                {company?.name || 'WorkNest'}
              </p>
            </div>
          )}
        </button>
      </div>

      {/* Role-Specific Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Role Section */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {roleNav.sectionLabel}
            </p>
          )}
          <div className="space-y-0.5">
            {roleNav.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={Boolean(item.end || item.to === '/admin' || item.to === '/dashboard' || item.to === '/hr' || item.to === '/manager' || item.to === '/employee')}
                  className={navLinkClass}
                  title={collapsed ? item.label : ''}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Account Section */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Account
            </p>
          )}
          <div className="space-y-0.5">
            {accountNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end ?? true}
                  className={navLinkClass}
                  title={collapsed ? item.label : ''}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Info + Actions */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-3 space-y-2">
        {/* Current User Snippet */}
        {!collapsed && currentUser && (
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
              {currentUser.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {ROLE_LABELS[currentUser.role] || currentUser.role}
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 cursor-pointer ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
