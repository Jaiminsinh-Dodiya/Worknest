import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { useApp } from '../../contexts/AppContext';

/**
 * Shared ProjectOverview component.
 * Displays a list of projects with progress, manager, due dates, and badges.
 *
 * @param {Array<object>} projects - List of projects to display
 * @param {string} title - Section title (default: 'Project Overview')
 * @param {string} viewAllPath - Navigation target for "View all" (default: '/projects')
 * @param {string} className - Additional CSS classes
 */
export default function ProjectOverview({
  projects = [],
  title = 'Project Overview',
  viewAllPath = '/projects',
  className = '',
}) {
  const navigate = useNavigate();
  const { getUserById } = useApp();

  return (
    <Card className={className} padding={false}>
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

      <div className="p-5 space-y-5">
        {projects.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No projects available.
          </p>
        ) : (
          projects.slice(0, 4).map((project) => {
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
          })
        )}
      </div>
    </Card>
  );
}
