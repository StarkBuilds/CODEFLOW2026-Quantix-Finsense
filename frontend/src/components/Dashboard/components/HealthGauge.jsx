/**
 * Semi-circular SVG gauge that visualises the financial health score (0–100).
 *
 * @param {{ score: number }} props
 */
export default function HealthGauge({ score }) {
  const s     = Math.max(0, Math.min(100, score || 0));
  const r     = 46;
  const circ  = Math.PI * r;               // half-circumference (180° arc)
  const off   = circ * (1 - s / 100);      // dash offset drives the fill

  const color = s >= 76 ? '#059669'
              : s >= 61 ? '#0f766e'
              : s >= 41 ? '#d97706'
              :            '#dc2626';

  const label = s >= 76 ? 'Excellent'
              : s >= 61 ? 'Good'
              : s >= 41 ? 'Fair'
              :            'Poor';

  return (
    <div className="health-gauge">
      <svg
        width="130"
        height="76"
        viewBox="0 0 130 76"
        aria-label={`Financial health score: ${s} out of 100 — ${label}`}
        role="img"
      >
        {/* Track */}
        <path
          d="M 13 68 A 52 52 0 0 1 117 68"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d="M 13 68 A 52 52 0 0 1 117 68"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        {/* Score text */}
        <text
          x="65"
          y="64"
          textAnchor="middle"
          fill={color}
          fontSize="22"
          fontWeight="bold"
          fontFamily="'JetBrains Mono', monospace"
        >
          {s}
        </text>
      </svg>

      <span className="health-gauge__label" style={{ color }}>
        {label}
      </span>
    </div>
  );
}