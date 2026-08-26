export default function ProgressBar({ value = 0, size = 'md', showLabel = false, className = '' }) {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const getColor = (val) => {
    if (val >= 80) return 'bg-emerald-500';
    if (val >= 50) return 'bg-primary-500';
    if (val >= 25) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{value}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-500 ease-out ${getColor(value)}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
