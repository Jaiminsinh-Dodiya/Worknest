import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { useApp } from '../../contexts/AppContext';

/**
 * Shared TaskList component.
 * Displays a table of tasks with project, assignee, priority, status, and due date.
 *
 * @param {Array<object>} tasks - List of tasks to display
 * @param {string} title - Section title (default: 'Recent Tasks')
 * @param {boolean} showAssignee - Whether to show the assignee column (default: true)
 * @param {string} viewAllPath - Path to navigate for "View all"
 */
export default function TaskList({
  tasks = [],
  title = 'Recent Tasks',
  showAssignee = true,
  viewAllPath = null,
}) {
  const navigate = useNavigate();
  const { getUserById, projects } = useApp();

  const displayTasks = tasks
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <Card padding={false}>
      <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {viewAllPath && (
          <button
            onClick={() => navigate(viewAllPath)}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        {displayTasks.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            No tasks found.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                {showAssignee && (
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned To</th>
                )}
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {displayTasks.map((task) => {
                const assignee = getUserById(task.assigneeId);
                const project = projects.find((p) => p.id === task.projectId);

                return (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{project?.name || '—'}</td>
                    {showAssignee && (
                      <td className="px-5 py-3">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={assignee.name} size="sm" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Unassigned</span>
                        )}
                      </td>
                    )}
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
        )}
      </div>
    </Card>
  );
}
