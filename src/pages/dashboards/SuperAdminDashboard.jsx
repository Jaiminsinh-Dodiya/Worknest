import { useNavigate } from 'react-router-dom';
import { Building2, Users as UsersIcon, FolderKanban, ShieldCheck, Bot, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsGrid from '../../components/dashboard/StatsGrid';
import QuickActions from '../../components/dashboard/QuickActions';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function SuperAdminDashboard() {
  const { currentUser, companies, users, projects } = useApp();
  const navigate = useNavigate();

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((c) => c.status === 'Active').length;
  const totalUsers = users.length;
  const totalProjects = projects.length;

  const stats = [
    { title: 'Total Companies', value: totalCompanies, icon: Building2, color: 'primary', trend: 15 },
    { title: 'Active Tenants', value: activeCompanies, icon: ShieldCheck, color: 'success', trend: 10 },
    { title: 'Platform Users', value: totalUsers, icon: UsersIcon, color: 'info', trend: 25 },
    { title: 'Total Projects', value: totalProjects, icon: FolderKanban, color: 'warning', trend: 8 },
  ];

  const quickActions = [
    { label: 'Manage Companies', icon: Building2, onClick: () => navigate('/admin/companies'), color: 'primary' },
    { label: 'Platform Users', icon: UsersIcon, onClick: () => navigate('/admin/users'), color: 'emerald' },
    { label: 'Consult AI Assistant', icon: Bot, onClick: () => navigate('/ai'), color: 'violet' },
  ];

  const recentActivity = [
    { id: '1', title: 'New tenant registered: TechNova Solutions', description: 'Starter plan activated with 2 initial seats.', timestamp: '2 hours ago', icon: Building2 },
    { id: '2', title: 'WorkNest Technologies created a new project', description: 'Website Redesign project milestones updated.', timestamp: '5 hours ago', icon: FolderKanban },
    { id: '3', title: 'Security scan completed successfully', description: 'All tenant databases verified healthy and isolated.', timestamp: '1 day ago', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Platform Administration"
        subtitle={`Welcome back, ${currentUser.name}. Overview of multi-tenant companies and platform metrics.`}
      />

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Companies Overview - 2 cols */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Registered Companies</h2>
            <button
              onClick={() => navigate('/admin/companies')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="p-5 space-y-4">
            {companies.map((c) => {
              const companyUsers = users.filter((u) => u.companyId === c.id);
              const companyProjects = projects.filter((p) => p.companyId === c.id);

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-700/40 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer"
                  onClick={() => navigate('/admin/companies')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {c.industry} • {companyUsers.length} Users • {companyProjects.length} Projects
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{c.plan}</Badge>
                    <Badge>{c.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions - 1 col */}
        <QuickActions actions={quickActions} title="Platform Actions" />
      </div>

      {/* Platform Activity Feed */}
      <ActivityFeed items={recentActivity} title="System & Tenant Activity" />
    </div>
  );
}
