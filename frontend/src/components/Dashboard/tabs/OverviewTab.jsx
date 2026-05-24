import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

import StatCard     from '../components/StatCard.jsx';
import CardSection  from '../components/CardSection.jsx';
import Badge        from '../components/Badge.jsx';
import ChartTooltip from '../components/ChartTooltip.jsx';
import { fmt, pct, cc } from '../../../utils/helpers.js';

export default function OverviewTab({
  summary,
  categoryBreakdown,
  monthlyTrend,
  recurringPayments,
  unusualTransactions,
  incomeStreams,
}) {
  const sortedCats = [...categoryBreakdown]
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="overview-tab">

      {/* ── Summary cards ──────────────────────────────────────────────── */}
      <div className="overview-cards">
        <StatCard
          label="Total Income"
          value={fmt(summary.totalIncome)}
          sub={`${incomeStreams?.length || 1} income source(s)`}
          icon="💰"
          color="var(--success)"
        />
        <StatCard
          label="Total Expenses"
          value={fmt(summary.totalExpenses)}
          sub={`${summary.transactionCount || 0} transactions`}
          icon="💸"
          color="var(--danger)"
        />
        <StatCard
          label="Net Savings"
          value={fmt(summary.netSavings)}
          sub={`${pct(summary.savingsRate)} savings rate`}
          icon="🏦"
          color={summary.netSavings >= 0 ? 'var(--primary)' : 'var(--danger)'}
        />
        <StatCard
          label="Closing Balance"
          value={fmt(summary.closingBalance)}
          sub={`Opened: ${fmt(summary.openingBalance)}`}
          icon="💳"
        />
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────── */}
      <div className="overview-charts">

        {/* Monthly trend area chart */}
        <CardSection title="Monthly Income vs Expenses" className="overview-chart-trend">
          {monthlyTrend.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={monthlyTrend} margin={{ top:5, right:10, bottom:5, left:10 }}>
                  <defs>
                    <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#16a34a" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#dc2626" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fill:'#94a3b8', fontSize:11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill:'#94a3b8', fontSize:10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="income"  name="Income"
                    stroke="#16a34a" fill="url(#gIncome)"  strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Expense"
                    stroke="#dc2626" fill="url(#gExpense)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>

              {/* Custom legend */}
              <div className="chart-legend">
                {[['#16a34a','Income'],['#dc2626','Expense']].map(([c, l]) => (
                  <span key={l} className="chart-legend__item">
                    <span className="chart-legend__dot" style={{ background: c }} />
                    {l}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="chart-empty">No monthly trend data available</p>
          )}
        </CardSection>

        {/* Category pie chart */}
        <CardSection title="Expense Breakdown" className="overview-chart-pie">
          {sortedCats.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={sortedCats.slice(0, 8)}
                    cx="50%" cy="50%"
                    innerRadius={38}
                    outerRadius={68}
                    dataKey="amount"
                    paddingAngle={2}
                  >
                    {sortedCats.slice(0, 8).map((entry) => (
                      <Cell key={entry.name} fill={cc(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => fmt(v)}
                    contentStyle={{
                      background: 'var(--surface)',
                      border:     '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize:   '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Top 5 category list */}
              <div className="cat-list">
                {sortedCats.slice(0, 5).map((c) => (
                  <div key={c.name} className="cat-list__row">
                    <div className="cat-list__label">
                      <span className="cat-list__dot" style={{ background: cc(c.name) }} />
                      <span>{c.name}</span>
                    </div>
                    <div className="cat-list__right">
                      <div className="cat-list__bar-track">
                        <div
                          className="cat-list__bar-fill"
                          style={{
                            width:      `${Math.min(100, c.percentage || 0)}%`,
                            background: cc(c.name),
                          }}
                        />
                      </div>
                      <span className="cat-list__amount mono">{fmt(c.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="chart-empty">No category data available</p>
          )}
        </CardSection>
      </div>

      {/* ── Bottom row: Recurring + Unusual ────────────────────────────── */}
      <div className="overview-bottom">

        {/* Recurring payments */}
        <CardSection title="🔁 Recurring Payments">
          {recurringPayments.length === 0 ? (
            <p className="empty-msg">No recurring payments detected</p>
          ) : (
            <div className="recurring-list">
              {recurringPayments.slice(0, 6).map((r, i) => (
                <div key={i} className="recurring-item">
                  <div className="recurring-item__info">
                    <p className="recurring-item__name">{r.narration}</p>
                    <div className="recurring-item__meta">
                      <span className="recurring-item__freq">{r.frequency}</span>
                      <Badge cat={r.category} />
                    </div>
                  </div>
                  <span className="recurring-item__amount mono">{fmt(r.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardSection>

        {/* Unusual transactions */}
        <CardSection title="⚠️ Unusual Transactions">
          {unusualTransactions.length === 0 ? (
            <p className="empty-msg">No unusual transactions detected</p>
          ) : (
            <div className="unusual-list">
              {unusualTransactions.slice(0, 5).map((u, i) => (
                <div key={i} className="unusual-item">
                  <div className="unusual-item__top">
                    <p className="unusual-item__name">{u.narration}</p>
                    <span className="unusual-item__amount mono">{fmt(u.amount)}</span>
                  </div>
                  <p className="unusual-item__reason">
                    {u.reason} &bull; {u.date}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardSection>

      </div>
    </div>
  );
}