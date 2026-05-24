/**
 * Metric summary card used in the Overview tab.
 *
 * @param {{ label: string, value: string, sub?: string, icon: string, color?: string }} props
 */
export default function StatCard({ label, value, sub, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__icon" aria-hidden="true">{icon}</span>
      </div>
      <div
        className="stat-card__value mono"
        style={{ color: color || 'var(--text-primary)' }}
      >
        {value}
      </div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}