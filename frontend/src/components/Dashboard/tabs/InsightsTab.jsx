import {
  BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

import CardSection  from '../components/CardSection.jsx';
import HealthGauge  from '../components/HealthGauge.jsx';
import ChartTooltip from '../components/ChartTooltip.jsx';
import { fmt, pct, cc } from '../../../utils/helpers.js';

const PRIORITY_STYLES = {
  high:   { border: '#ef4444', bg: '#fef2f2', badge: '#dc2626' },
  medium: { border: '#f59e0b', bg: '#fffbeb', badge: '#d97706' },
  low:    { border: '#0f766e', bg: '#f0fdf4', badge: '#0f766e' },
};

export default function InsightsTab({
  summary,
  categoryBreakdown,
  recommendations,
  aiSummary,
  incomeStreams,
}) {
  const sortedCats = [...categoryBreakdown]
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  const barHeight = Math.max(220, sortedCats.length * 40 + 60);

  return (
    <div className="insights-tab">

      {/* ── Row 1: Health score + AI summary ─────────────────────────── */}
      <div className="insights-top">

        {/* Financial health score */}
        <CardSection title="Financial Health" className="insights-health">
          <div className="insights-health__gauge">
            <HealthGauge score={summary.financialHealthScore || 0} />
          </div>

          <div className="insights-health__metrics">
            {[
              ['Savings Rate', pct(summary.savingsRate),    summary.savingsRate  >= 20],
              ['Top Expense',  summary.topCategory || '—',  true],
              ['Net Flow',     fmt(summary.netSavings),      summary.netSavings  >= 0],
            ].map(([label, value, positive]) => (
              <div key={label} className="insights-metric">
                <span className="insights-metric__label">{label}</span>
                <span
                  className="insights-metric__value"
                  style={{ color: positive ? 'var(--primary)' : 'var(--warning)' }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </CardSection>

        {/* AI-generated summary */}
        <CardSection title="🤖 AI Financial Summary" className="insights-summary">
          {aiSummary ? (
            <p className="insights-summary__text">{aiSummary}</p>
          ) : (
            <p className="empty-msg">No AI summary generated. Please re-analyse your statement.</p>
          )}
        </CardSection>

      </div>

      {/* ── Recommendations ──────────────────────────────────────────── */}
      <CardSection title="💡 Personalised Recommendations">
        {recommendations.length === 0 ? (
          <p className="empty-msg">No recommendations generated.</p>
        ) : (
          <div className="rec-list">
            {recommendations.map((r, i) => {
              const style = PRIORITY_STYLES[r.priority] || PRIORITY_STYLES.low;
              return (
                <div
                  key={i}
                  className="rec-item"
                  style={{ background: style.bg, borderLeftColor: style.border }}
                >
                  <span className="rec-item__icon" aria-hidden="true">{r.icon || '💡'}</span>
                  <div className="rec-item__body">
                    <div className="rec-item__header">
                      <h4 className="rec-item__title">{r.title}</h4>
                      <span
                        className="rec-item__badge"
                        style={{ background: style.badge + '20', color: style.badge }}
                      >
                        {r.priority}
                      </span>
                    </div>
                    <p className="rec-item__desc">{r.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardSection>

      {/* ── Category bar chart ───────────────────────────────────────── */}
      <CardSection title="📊 Category-wise Expense Breakdown">
        {sortedCats.length > 0 ? (
          <ResponsiveContainer width="100%" height={barHeight}>
            <BarChart
              data={sortedCats}
              layout="vertical"
              margin={{ left: 10, right: 60, top: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fill:'#94a3b8', fontSize:11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill:'#475569', fontSize:12 }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="amount"
                name="Amount"
                radius={[0, 5, 5, 0]}
                label={{
                  position:  'right',
                  fontSize:  11,
                  fill:      '#94a3b8',
                  formatter: (v) => `₹${(v / 1000).toFixed(0)}k`,
                }}
              >
                {sortedCats.map((entry) => (
                  <Cell key={entry.name} fill={cc(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="empty-msg">No category data available.</p>
        )}
      </CardSection>

      {/* ── Income streams ───────────────────────────────────────────── */}
      {incomeStreams?.length > 0 && (
        <CardSection title="💰 Income Streams">
          <div className="income-grid">
            {incomeStreams.map((s, i) => (
              <div key={i} className="income-card">
                <p className="income-card__source">{s.source}</p>
                <p className="income-card__amount mono">{fmt(s.amount)}</p>
                <p className="income-card__freq">{s.frequency}</p>
              </div>
            ))}
          </div>
        </CardSection>
      )}

    </div>
  );
}