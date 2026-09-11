import { useNavigate } from 'react-router-dom';
import { FolderKanban, ClipboardList, CheckCircle2, Clock, Plus, Bot, Users } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsGrid from '../../components/dashboard/StatsGrid';
import ProjectOverview from '../../components/dashboard/ProjectOverview';
import QuickActions from '../../components/dashboard/QuickActions';
import TaskList from '../../components/dashboard/TaskList';

export default function ManagerDashboard() {
  const { currentUser, getVisibleProjects, getVisibleTasks } = useApp();
  const navigate = useNavigate();

  const managerProjects = getVisibleProjects();
  const myManagedCount = managerProjects.filter((p) => p.managerId === currentUser.id).length;

  const teamTasks = getVisibleTasks();
  const activeTasks = teamTasks.filter((t) => t.status === 'In Progress').length;
  const completedTasks = teamTasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = teamTasks.filter((t) => t.status === 'Todo').length;

  const stats = [
    { title: 'My Projects', value: myManagedCount, icon: FolderKanban, color: 'primary', trend: 10 },
    { title: 'In Progress Tasks', value: activeTasks, icon: Clock, color: 'info', trend: 5 },
    { title: 'Tasks Pending', value: pendingTasks, icon: ClipboardList, color: 'warning', trend: -3 },
    { title: 'Completed Tasks', value: completedTasks, icon: CheckCircle2, color: 'success', trend: 18 },
  ];

  const quickActions = [
    { label: 'Create New Project', icon: Plus, onClick: () => navigate('/projects'), color: 'primary' },
    { label: 'Assign Team Task', icon: Plus, onClick: () => navigate('/projects'), color: 'amber' },
    { label: 'View Team Members', icon: Users, onClick: () => navigate('/users'), color: 'emerald' },
    { label: 'AI Project Summary', icon: Bot, onClick: () => navigate('/ai'), color: 'violet' },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Project & Team Workspace"
        subtitle={`Welcome back, ${currentUser.name.split(' ')[0]}. Here is your team's project pipeline and active deliverables.`}
      />

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProjectOverview projects={managerProjects} title="Managed Projects" className="lg:col-span-2" />
        <QuickActions actions={quickActions} title="Manager Actions" />
      </div>

      <TaskList tasks={teamTasks} title="Team Task Feed" />
    </div>
  );
}
