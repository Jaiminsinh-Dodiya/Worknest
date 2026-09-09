import StatCard from '../ui/StatCard';

/**
 * Shared StatsGrid component.
 * Renders a responsive grid of StatCards based on stats prop.
 *
 * @param {Array<{ title: string, value: number|string, icon: any, color?: string, trend?: number }>} stats
 */
export default function StatsGrid({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color || 'primary'}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}
