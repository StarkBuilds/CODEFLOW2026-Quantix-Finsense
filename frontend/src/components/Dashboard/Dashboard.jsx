import "./Dashboard.css";

export default function Dashboard({ data }) {
  return (
    <div className="dashboard">
      <h1>Bank Dashboard</h1>

      <div className="card">
        <h2>Total Income</h2>
        <p>₹{data.summary.totalIncome}</p>
      </div>

      <div className="card">
        <h2>Total Expenses</h2>
        <p>₹{data.summary.totalExpenses}</p>
      </div>

      <div className="card">
        <h2>Net Savings</h2>
        <p>₹{data.summary.netSavings}</p>
      </div>
    </div>
  );
}