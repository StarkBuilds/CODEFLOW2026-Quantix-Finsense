export default function SummaryCards({ summary }) {
  return (
    <div className="summary-grid">
      <div className="card">
        <h3>Total Income</h3>
        <p>₹{summary.totalIncome}</p>
      </div>

      <div className="card">
        <h3>Total Expenses</h3>
        <p>₹{summary.totalExpenses}</p>
      </div>

      <div className="card">
        <h3>Net Savings</h3>
        <p>₹{summary.netSavings}</p>
      </div>
    </div>
  );
}