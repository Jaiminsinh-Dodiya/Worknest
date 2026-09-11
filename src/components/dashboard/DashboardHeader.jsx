/**
 * Shared Dashboard Header — Welcome message with role context.
 */
export default function DashboardHeader({ title, subtitle }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
