const statusStyles = {
  Active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Completed: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'In Progress': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Todo: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400',
  'On Hold': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Inactive: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const priorityStyles = {
  High: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Low: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function Badge({ children, variant = 'status', className = '' }) {
  const styles = variant === 'priority' ? priorityStyles : statusStyles;
  const colorClass = styles[children] || 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {children}
    </span>
  );
}
