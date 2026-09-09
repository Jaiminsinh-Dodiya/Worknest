import Card from '../ui/Card';

const colorStyles = {
  primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
};

/**
 * Shared QuickActions component.
 * Displays a list of action buttons.
 *
 * @param {Array<{ label: string, icon: any, onClick: Function, color?: string }>} actions
 * @param {string} title - Section title (default: 'Quick Actions')
 */
export default function QuickActions({
  actions = [],
  title = 'Quick Actions',
}) {
  if (!actions.length) return null;

  return (
    <Card padding={false}>
      <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      <div className="p-5 space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const style = colorStyles[action.color || 'primary'] || colorStyles.primary;

          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer text-left"
            >
              <div className={`p-1.5 rounded-lg ${style}`}>
                <Icon size={14} />
              </div>
              <span className="font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
