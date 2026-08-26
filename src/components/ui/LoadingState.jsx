export default function LoadingState({ lines = 3, className = '' }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded" style={{ width: `${40 + Math.random() * 30}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
