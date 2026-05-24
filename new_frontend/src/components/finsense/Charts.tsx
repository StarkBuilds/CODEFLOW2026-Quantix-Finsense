import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import type { Tx } from "@/lib/finsense-types";

const PALETTE = [
  "var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)",
  "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-chart-6)",
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {label && <div className="mb-1 font-medium text-foreground">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-auto font-medium tabular-nums text-foreground">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="h-[280px] w-full">{children}</div>
    </div>
  );
}

export function ExpenseDonut({ transactions }: { transactions: Tx[] }) {
  const grouped = new Map<string, number>();
  transactions
    .filter((t) => t.type === "DEBIT")
    .forEach((t) => grouped.set(t.category || "Uncategorized", (grouped.get(t.category || "Uncategorized") || 0) + t.amount));
  const data = Array.from(grouped, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Panel title="Expenses by Category" subtitle="Where your money is going">
      {data.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="relative h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={2} stroke="none">
                {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip content={<TooltipBox />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span>
            <span className="text-lg font-semibold tabular-nums">{fmt(total)}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {data.slice(0, 6).map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}

export function IncomeExpenseBar({ summary, transactions }: { summary: { totalIncome: number; totalExpense: number } | null; transactions: Tx[] }) {
  // Group by month from transactions for richer chart, fallback to summary
  const map = new Map<string, { month: string; Income: number; Expense: number }>();
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = d.toLocaleString("en-US", { month: "short" });
    if (!map.has(key)) map.set(key, { month: key, Income: 0, Expense: 0 });
    const row = map.get(key)!;
    if (t.type === "CREDIT") row.Income += t.amount;
    else row.Expense += t.amount;
  });
  let data = Array.from(map.values());
  if (data.length === 0 && summary) {
    data = [{ month: "Current", Income: summary.totalIncome, Expense: summary.totalExpense }];
  }

  return (
    <Panel title="Income vs. Expense" subtitle="Monthly cash flow">
      {data.length === 0 ? <EmptyChart /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
            <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--color-muted)", opacity: 0.3 }} />
            <Bar dataKey="Income" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Expense" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-full place-items-center text-sm text-muted-foreground">
      Upload a statement to see your analysis
    </div>
  );
}
