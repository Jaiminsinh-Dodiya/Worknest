import WindowControls from './WindowControls';

export default function TitleBar({ title = 'WorkNest' }) {
  return (
    <div
      className="h-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 select-none flex-shrink-0 z-50"
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* Left: macOS Traffic Lights */}
      <div className="flex items-center gap-3">
        <WindowControls />
      </div>

      {/* Center: Window Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-300 pointer-events-none">
        {title}
      </div>

      {/* Right placeholder for symmetry */}
      <div className="w-16" />
    </div>
  );
}
