export default function Card({ children, className = '', hover = false, padding = true, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl ${padding ? 'p-5' : ''} ${hover ? 'hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-200 cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
