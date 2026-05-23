import { useState } from 'react';
import Badge from '../components/Badge.jsx';
import { fmt } from '../../../utils/helpers.js';

const FILTERS = [
  { id: 'all',       label: '🔘 All'       },
  { id: 'debit',     label: '📤 Debits'    },
  { id: 'credit',    label: '📥 Credits'   },
  { id: 'recurring', label: '🔁 Recurring' },
  { id: 'unusual',   label: '⚠️ Unusual'  },
];

const PAGE_SIZE = 100;

/**
 * @param {{ transactions: Array<Object> }} props
 */
export default function TransactionsTab({ transactions }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((t) => {
    if (filter === 'debit'     && !(t.debit   > 0))  return false;
    if (filter === 'credit'    && !(t.credit  > 0))  return false;
    if (filter === 'recurring' && !t.isRecurring)     return false;
    if (filter === 'unusual'   && !t.isUnusual)       return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.narration?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="tx-tab card-section">

      {/* ── Filter / search bar ───────────────────────────────────────── */}
      <div className="tx-toolbar">
        <input
          className="tx-search"
          type="search"
          placeholder="Search transactions or categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search transactions"
        />

        <div className="tx-filters" role="group" aria-label="Filter transactions">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`tx-filter-btn ${filter === f.id ? 'tx-filter-btn--active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="tx-count">{filtered.length} records</span>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="tx-table-wrap">
        <table className="tx-table" aria-label="Transaction list">
          <thead>
            <tr>
              <th className="tx-th tx-th--left">Date</th>
              <th className="tx-th tx-th--left">Narration</th>
              <th className="tx-th tx-th--left">Category</th>
              <th className="tx-th tx-th--right">Debit</th>
              <th className="tx-th tx-th--right">Credit</th>
              <th className="tx-th tx-th--right">Balance</th>
            </tr>
          </thead>

          <tbody>
            {filtered.slice(0, PAGE_SIZE).map((t, i) => (
              <tr key={t.id ?? i} className="tx-row">
                <td className="tx-td tx-td--date mono">{t.date}</td>

                <td className="tx-td tx-td--narration">
                  <p className="tx-narration">{t.narration}</p>
                  <div className="tx-flags">
                    {t.isRecurring && (
                      <span className="tx-flag tx-flag--recurring">🔁 Recurring</span>
                    )}
                    {t.isUnusual && (
                      <span className="tx-flag tx-flag--unusual">⚠️ Unusual</span>
                    )}
                  </div>
                </td>

                <td className="tx-td"><Badge cat={t.category} /></td>

                <td className="tx-td tx-td--right mono tx-td--debit">
                  {t.debit > 0 ? fmt(t.debit) : '—'}
                </td>

                <td className="tx-td tx-td--right mono tx-td--credit">
                  {t.credit > 0 ? fmt(t.credit) : '—'}
                </td>

                <td className="tx-td tx-td--right mono tx-td--balance">
                  {t.balance != null && t.balance !== '' ? fmt(t.balance) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="tx-empty">No transactions match your filter.</p>
        )}

        {filtered.length > PAGE_SIZE && (
          <p className="tx-pagination">
            Showing {PAGE_SIZE} of {filtered.length} transactions.
          </p>
        )}
      </div>
    </div>
  );
}