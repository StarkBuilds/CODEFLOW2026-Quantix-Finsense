import { fmt } from '../../../utils/helpers.js';

/**
 * Custom tooltip used across all recharts charts.
 * Pass as: <Tooltip content={<ChartTooltip />} />
 */
export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      {label && <p className="chart-tooltip__label">{label}</p>}
      {payload.map((entry, i) => (
        <p
          key={i}
          className="chart-tooltip__value mono"
          style={{ color: entry.color }}
        >
          {entry.name}: {fmt(entry.value)}
        </p>
      ))}
    </div>
  );
}