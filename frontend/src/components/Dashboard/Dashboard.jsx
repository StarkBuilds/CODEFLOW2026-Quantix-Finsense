import { useMemo, useState } from 'react';
import OverviewTab from './tabs/OverviewTab.jsx';
import TransactionsTab from './tabs/TransactionsTab.jsx';
import InsightsTab from './tabs/InsightsTab.jsx';
import './Dashboard.css';

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'transactions', label: '📋 Transactions' },
  { id: 'insights', label: '🤖 AI Insights' },
];

function monthKey(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr.slice(0, 7);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

/** Normalize backend API payload into the shape expected by tab components. */
function enrichDashboardData(data) {
  if (!data) {
    return {
      summary: {},
      transactions: [],
      categoryBreakdown: [],
      monthlyTrend: [],
      recurringPayments: [],
      unusualTransactions: [],
      incomeStreams: [],
      aiSummary: '',
      recommendations: [],
    };
  }

  if (data.categoryBreakdown?.length || data.aiSummary) {
    return data;
  }

  const transactions = data.transactions ?? [];
  const raw = data.summary ?? {};
  const totalIncome = raw.totalIncome ?? 0;
  const totalExpenses = raw.totalExpenses ?? raw.totalExpense ?? 0;
  const netSavings = raw.netSavings ?? totalIncome - totalExpenses;
  const savingsRate =
    raw.savingsRate ?? (totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0);

  const debitTotals = {};
  for (const t of transactions) {
    if (t.debit > 0) {
      const cat = t.category || 'Other';
      debitTotals[cat] = (debitTotals[cat] || 0) + t.debit;
    }
  }

  const categoryBreakdown = Object.entries(debitTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      count: transactions.filter((t) => t.category === name && t.debit > 0).length,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = categoryBreakdown[0]?.name ?? '—';

  const monthMap = {};
  for (const t of transactions) {
    const key = monthKey(t.date);
    if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expense: 0 };
    monthMap[key].income += t.credit || 0;
    monthMap[key].expense += t.debit || 0;
  }
  const monthlyTrend = Object.values(monthMap);

  const dates = transactions.map((t) => t.date).filter(Boolean).sort();
  const period =
    raw.period ??
    (dates.length > 0 ? `${dates[0]} – ${dates[dates.length - 1]}` : '');

  const narrationCounts = {};
  for (const t of transactions) {
    if (t.debit > 0) {
      const key = `${t.narration}|${t.debit}`;
      narrationCounts[key] = (narrationCounts[key] || 0) + 1;
    }
  }

  const recurringPayments = transactions
    .filter((t) => t.debit > 0 && narrationCounts[`${t.narration}|${t.debit}`] >= 2)
    .slice(0, 6)
    .map((t) => ({
      narration: t.narration,
      amount: t.debit,
      frequency: 'Monthly',
      category: t.category,
    }));

  const debits = transactions.filter((t) => t.debit > 0).map((t) => t.debit);
  const avgDebit = debits.length ? debits.reduce((a, b) => a + b, 0) / debits.length : 0;
  const unusualTransactions = transactions
    .filter((t) => t.debit > avgDebit * 2.5 && t.debit > 5000)
    .slice(0, 5)
    .map((t) => ({
      date: t.date,
      narration: t.narration,
      amount: t.debit,
      reason: 'Unusually large debit',
    }));

  const incomeByCat = {};
  for (const t of transactions) {
    if (t.credit > 0) {
      const src = t.category || 'Income';
      incomeByCat[src] = (incomeByCat[src] || 0) + t.credit;
    }
  }
  const incomeStreams = Object.entries(incomeByCat).map(([source, amount]) => ({
    source,
    amount,
    frequency: 'Monthly',
  }));

  const healthScore = raw.financialHealthScore ?? raw.healthScore ?? 50;
  const aiSummary =
    raw.aiSummary ??
    `You recorded ${transactions.length} transactions with total income of ₹${totalIncome.toLocaleString('en-IN')} and expenses of ₹${totalExpenses.toLocaleString('en-IN')}. ` +
      `Net savings: ₹${netSavings.toLocaleString('en-IN')}. Top spending category: ${topCategory}.`;

  const recommendations = [];
  if (savingsRate < 20) {
    recommendations.push({
      title: 'Boost your savings rate',
      description: 'Try reducing discretionary spending in your top expense categories.',
      priority: 'high',
      icon: '💡',
    });
  }
  if (categoryBreakdown.length > 0) {
    recommendations.push({
      title: `Review ${topCategory} spending`,
      description: `${topCategory} is your largest expense category this period.`,
      priority: 'medium',
      icon: '📊',
    });
  }

  return {
    ...data,
    transactions,
    categoryBreakdown,
    monthlyTrend,
    recurringPayments,
    unusualTransactions,
    incomeStreams,
    aiSummary,
    recommendations,
    summary: {
      ...raw,
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      topCategory,
      period,
      financialHealthScore: healthScore,
      transactionCount: raw.transactionCount ?? transactions.length,
      openingBalance: raw.openingBalance ?? 0,
      closingBalance: raw.closingBalance ?? 0,
    },
  };
}

export default function Dashboard({ data, onNewAnalysis, onLogout, user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const view = useMemo(() => enrichDashboardData(data), [data]);

  const {
    summary = {},
    categoryBreakdown = [],
    monthlyTrend = [],
    recurringPayments = [],
    unusualTransactions = [],
    transactions = [],
    aiSummary = '',
    recommendations = [],
    incomeStreams = [],
  } = view;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="dashboard-brand__icon" aria-hidden="true">
            ₹
          </div>
          <div>
            <span className="dashboard-brand__name">
              FinSight<span className="dashboard-brand__accent">AI</span>
            </span>
            {user?.email && (
              <p className="dashboard-brand__user">{user.email}</p>
            )}
            {summary.period && (
              <span className="dashboard-brand__period">&bull; {summary.period}</span>
            )}
          </div>
        </div>

        <nav className="dashboard-tabs" aria-label="Dashboard sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`dashboard-tab ${activeTab === tab.id ? 'dashboard-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="dashboard-actions">
          <button type="button" className="dashboard-new-btn" onClick={onNewAnalysis}>
            + New Analysis
          </button>
          {onLogout && (
            <button type="button" className="dashboard-logout-btn" onClick={onLogout}>
              Log out
            </button>
          )}
        </div>
      </header>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <OverviewTab
            summary={summary}
            categoryBreakdown={categoryBreakdown}
            monthlyTrend={monthlyTrend}
            recurringPayments={recurringPayments}
            unusualTransactions={unusualTransactions}
            incomeStreams={incomeStreams}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab transactions={transactions} />
        )}

        {activeTab === 'insights' && (
          <InsightsTab
            summary={summary}
            categoryBreakdown={categoryBreakdown}
            recommendations={recommendations}
            aiSummary={aiSummary}
            incomeStreams={incomeStreams}
          />
        )}
      </main>
    </div>
  );
}
