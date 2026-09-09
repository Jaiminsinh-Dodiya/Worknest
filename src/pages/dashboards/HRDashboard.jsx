import { useNavigate } from 'react-router-dom';
import { Users as UsersIcon, UserCheck, UserX, Building, Plus, Bot, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsGrid from '../../components/dashboard/StatsGrid';
import QuickActions from '../../components/dashboard/QuickActions';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { ROLE_LABELS } from '../../config/roles';

export default function HRDashboard() {
  const { currentUser, company, allUsers } = useApp();
  const navigate = useNavigate();

  const totalEmployees = allUsers.length;
  const activeEmployees = allUsers.filter((u) => u.status === 'Active').length;
  const inactiveEmployees = allUsers.filter((u) => u.status === 'Inactive').length;

  const departmentCounts = allUsers.reduce((acc, user) => {
    acc[user.department] = (acc[user.department] || 0) + 1;
    return acc;
  }, {});

  const totalDepartments = Object.keys(departmentCounts).length;

  const stats = [
    { title: 'Total Employees', value: totalEmployees, icon: UsersIcon, color: 'primary', trend: 14 },
    { title: 'Active Staff', value: activeEmployees, icon: UserCheck, color: 'success', trend: 5 },
    { title: 'Inactive Staff', value: inactiveEmployees, icon: UserX, color: 'warning', trend: -2 },
    { title: 'Departments', value: totalDepartments, icon: Building, color: 'info', trend: 0 },
  ];

  const quickActions = [
    { label: 'Add New Employee', icon: Plus, onClick: () => navigate('/users'), color: 'primary' },
    { label: 'View Employee Directory', icon: UsersIcon, onClick: () => navigate('/users'), color: 'emerald' },
    { label: 'HR Policy & AI Assistant', icon: Bot, onClick: () => navigate('/ai'), color: 'violet' },
  ];

  const hrActivity = [
    { id: '1', title: 'Deepa Nair onboarded to QA team', description: 'Assigned to Quality Assurance department.', timestamp: '3 days ago', icon: UserCheck },
    { id: '2', title: 'Karan Joshi status updated to Inactive', description: 'Department development record updated.', timestamp: '1 week ago', icon: UserX },
    { id: '3', title: 'Quarterly workforce review completed', description: `${totalEmployees} employees verified in ${company.name}.`, timestamp: '2 weeks ago', icon: Building },
  ];

  const recentStaff = allUsers.slice(0, 5);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Human Resources Portal"
        subtitle={`Welcome back, ${currentUser.name}. Workforce overview and team management for ${company.name}.`}
      />

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Employees - 2 cols */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Team Directory</h2>
            <button
              onClick={() => navigate('/users')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              Manage all <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {recentStaff.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="md" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.department} • {ROLE_LABELS[user.role] || user.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <Badge>{user.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions - 1 col */}
        <QuickActions actions={quickActions} title="HR Actions" />
      </div>

      {/* HR Activity Feed */}
      <ActivityFeed items={hrActivity} title="Workforce Activity" />
    </div>
  );
}
