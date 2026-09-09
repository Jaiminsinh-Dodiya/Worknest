import { useNavigate } from 'react-router-dom';
import { Users as UsersIcon, FolderKanban, ClipboardList, CheckCircle2, Plus, Bot } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsGrid from '../../components/dashboard/StatsGrid';
import ProjectOverview from '../../components/dashboard/ProjectOverview';
import QuickActions from '../../components/dashboard/QuickActions';
import TaskList from '../../components/dashboard/TaskList';

export default function CompanyOwnerDashboard() {
  const { currentUser, company, getVisibleUsers, getVisibleProjects, getVisibleTasks } = useApp();
  const navigate = useNavigate();

  const companyUsers = getVisibleUsers();
  const totalEmployees = companyUsers.length + 1; // +1 for current owner

  const companyProjects = getVisibleProjects();
  const activeProjects = companyProjects.filter((p) => p.status === 'Active').length;

  const companyTasks = getVisibleTasks();
  const pendingTasks = companyTasks.filter((t) => t.status !== 'Completed').length;
  const completedTasks = companyTasks.filter((t) => t.status === 'Completed').length;

  const stats = [
    { title: 'Total Employees', value: totalEmployees, icon: UsersIcon, color: 'primary', trend: 12 },
    { title: 'Active Projects', value: activeProjects, icon: FolderKanban, color: 'info', trend: 8 },
    { title: 'Pending Tasks', value: pendingTasks, icon: ClipboardList, color: 'warning', trend: -5 },
    { title: 'Completed Tasks', value: completedTasks, icon: CheckCircle2, color: 'success', trend: 23 },
  ];

  const quickActions = [
    { label: 'New Project', icon: Plus, onClick: () => navigate('/projects'), color: 'primary' },
    { label: 'Add User', icon: Plus, onClick: () => navigate('/users'), color: 'emerald' },
    { label: 'Create Task', icon: Plus, onClick: () => navigate('/projects'), color: 'amber' },
    { label: 'Ask AI Assistant', icon: Bot, onClick: () => navigate('/ai'), color: 'violet' },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={`Company Dashboard — ${company.name}`}
        subtitle={`Welcome back, ${currentUser.name.split(' ')[0]}. Executive overview of your organization's projects and team.`}
      />

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProjectOverview projects={companyProjects} className="lg:col-span-2" />
        <QuickActions actions={quickActions} />
      </div>

      <TaskList tasks={companyTasks} title="Recent Company Tasks" />
    </div>
  );
}
