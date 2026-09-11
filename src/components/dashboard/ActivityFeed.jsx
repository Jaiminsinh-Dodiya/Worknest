import Card from '../ui/Card';

/**
 * Shared ActivityFeed component.
 * Displays a chronological list of activities.
 *
 * @param {Array<{ id: string, title: string, description?: string, timestamp: string, icon?: any, badge?: string }>} items
 * @param {string} title - Section title (default: 'Recent Activity')
 * @param {string} className - Optional CSS classes
 */
export default function ActivityFeed({
  items = [],
  title = 'Recent Activity',
  className = '',
}) {
  return (
    <Card className={className} padding={false}>
      <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      <div className="p-5">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No recent activity recorded.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-start gap-3">
                  {Icon && (
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 flex-shrink-0 mt-0.5">
                      <Icon size={14} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                    {item.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
