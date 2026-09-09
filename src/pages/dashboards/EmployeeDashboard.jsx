import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, CheckCircle2, AlertCircle, Bot, FolderKanban } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsGrid from '../../components/dashboard/StatsGrid';
import ProjectOverview from '../../components/dashboard/ProjectOverview';
import QuickActions from '../../components/dashboard/QuickActions';
import TaskList from '../../components/dashboard/TaskList';

export default function EmployeeDashboard() {
  const { currentUser, getMyTasks, getVisibleProjects } = useApp();
  const navigate = useNavigate();

  const myTasks = getMyTasks();
  const totalMyTasks = myTasks.length;
  const inProgressTasks = myTasks.filter((t) => t.status === 'In Progress').length;
  const completedTasks = myTasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = myTasks.filter((t) => t.status === 'Todo').length;

  const myProjects = getVisibleProjects();

  const stats = [
    { title: 'My Total Tasks', value: totalMyTasks, icon: CheckSquare, color: 'primary', trend: 8 },
    { title: 'In Progress', value: inProgressTasks, icon: Clock, color: 'info', trend: 3 },
    { title: 'Pending To-Do', value: pendingTasks, icon: AlertCircle, color: 'warning', trend: -2 },
    { title: 'Completed', value: completedTasks, icon: CheckCircle2, color: 'success', trend: 20 },
  ];

  const quickActions = [
    { label: 'View My Tasks', icon: CheckSquare, onClick: () => navigate('/my-tasks'), color: 'primary' },
    { label: 'My Projects', icon: FolderKanban, onClick: () => navigate('/projects'), color: 'emerald' },
    { label: 'Ask AI Assistant', icon: Bot, onClick: () => navigate('/ai'), color: 'violet' },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Personal Workspace"
        subtitle={`Welcome back, ${currentUser.name.split(' ')[0]}. Here are your personal tasks and assigned project deliverables.`}
      />

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProjectOverview projects={myProjects} title="My Assigned Projects" className="lg:col-span-2" />
        <QuickActions actions={quickActions} title="My Shortcuts" />
      </div>

      <TaskList tasks={myTasks} title="My Assigned Tasks" showAssignee={false} viewAllPath="/my-tasks" />
    </div>
  );
}
