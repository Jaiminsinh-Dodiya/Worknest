import { useNavigate } from 'react-router-dom';
import {
  Users as UsersIcon,
  FolderKanban,
  ClipboardList,
  CheckCircle2,
  Plus,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';

export default function Dashboard() {
  const { currentUser, users, projects, tasks, getUserById } = useApp();
  const navigate = useNavigate();

  const totalEmployees = users.length + 1; // +1 for current user
  const activeProjects = projects.filter((p) => p.status === 'Active').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;

  const recentTasks = tasks
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const activeProjectsList = projects.filter((p) => p.status !== 'Completed').slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {"Welcome back, " + currentUser.name.split(' ')[0] + ". Here's what's happening with your workspace today."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={totalEmployees} icon={UsersIcon} color="primary" trend={12} />
        <StatCard title="Active Projects" value={activeProjects} icon={FolderKanban} color="info" trend={8} />
        <StatCard title="Pending Tasks" value={pendingTasks} icon={ClipboardList} color="warning" trend={-5} />
        <StatCard title="Completed Tasks" value={completedTasks} icon={CheckCircle2} color="success" trend={23} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Overview - 2 cols */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Project Overview</h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="p-5 space-y-5">
            {activeProjectsList.map((project) => {
              const manager = getUserById(project.managerId);
              return (
                <div
                  key={project.id}
                  className="flex items-center gap-4 cursor-pointer group"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                        {project.name}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {project.progress}%
                      </span>
                    </div>
                    <ProgressBar value={project.progress} size="sm" />
                    <div className="flex items-center gap-2 mt-1.5">
                      {manager && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {manager.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Due {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <Badge>{project.status}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions - 1 col */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h2>
          </div>
          <div className="p-5 space-y-2">
            <button
              onClick={() => navigate('/projects')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <div className="p-1.5 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                <Plus size={14} className="text-primary-600 dark:text-primary-400" />
              </div>
              New Project
            </button>
            <button
              onClick={() => navigate('/users')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <Plus size={14} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              Add User
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                <Plus size={14} className="text-amber-600 dark:text-amber-400" />
              </div>
              Create Task
            </button>
            <button
              onClick={() => navigate('/ai')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <div className="p-1.5 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
                <Bot size={14} className="text-violet-600 dark:text-violet-400" />
              </div>
              Ask AI
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Tasks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned To</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {recentTasks.map((task) => {
                const assignee = getUserById(task.assigneeId);
                const project = projects.find((p) => p.id === task.projectId);
                return (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{project?.name || '—'}</td>
                    <td className="px-5 py-3">
                      {assignee && (
                        <div className="flex items-center gap-2">
                          <Avatar name={assignee.name} size="sm" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{assignee.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="priority">{task.priority}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge>{task.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
