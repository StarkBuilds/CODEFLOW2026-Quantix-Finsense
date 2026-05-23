import { useState } from 'react';
import OverviewTab      from './tabs/OverviewTab.jsx';
import TransactionsTab  from './tabs/TransactionsTab.jsx';
import InsightsTab      from './tabs/InsightsTab.jsx';
import './Dashboard.css';

const TABS = [
  { id: 'overview',     label: '📊 Overview'      },
  { id: 'transactions', label: '📋 Transactions'  },
  { id: 'insights',     label: '🤖 AI Insights'   },
];

/**
 * @param {{ data: Object, onNewAnalysis: () => void }} props
 */
export default function Dashboard({ data, onNewAnalysis }) {
  const [activeTab, setActiveTab] = useState('overview');

  const {
    summary             = {},
    categoryBreakdown   = [],
    monthlyTrend        = [],
    recurringPayments   = [],
    unusualTransactions = [],
    transactions        = [],
    aiSummary           = '',
    recommendations     = [],
    incomeStreams        = [],
  } = data;

  return (
    <div className="dashboard">

      {/* ── Sticky header ────────────────────────────────────────────── */}
      <header className="dashboard-header">
        {/* Brand */}
        <div className="dashboard-brand">
          <div className="dashboard-brand__icon" aria-hidden="true">₹</div>
          <span className="dashboard-brand__name">
            FinSight<span className="dashboard-brand__accent">AI</span>
          </span>
          {summary.period && (
            <span className="dashboard-brand__period">&bull; {summary.period}</span>
          )}
        </div>

        {/* Tab navigation */}
        <nav className="dashboard-tabs" aria-label="Dashboard sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`dashboard-tab ${activeTab === tab.id ? 'dashboard-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* New analysis */}
        <button className="dashboard-new-btn" onClick={onNewAnalysis}>
          + New Analysis
        </button>
      </header>

      {/* ── Tab content ──────────────────────────────────────────────── */}
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