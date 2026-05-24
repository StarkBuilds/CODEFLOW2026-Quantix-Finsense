import { ArrowDownRight, ArrowUpRight, Activity } from "lucide-react";

type Summary = { totalIncome: number; totalExpense: number; healthScore: number } | null;

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function Card({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-3xl"
        style={{ background: accent }}
      />
      {children}
    </div>
  );
}

function Skeleton() {
  return <div className="h-7 w-32 animate-pulse rounded bg-muted" />;
}

export function KpiCards({ summary, loading }: { summary: Summary; loading: boolean }) {
  const score = summary?.healthScore ?? 0;
  const scoreColor =
    score >= 75 ? "var(--color-success)" : score >= 50 ? "var(--color-warning)" : "var(--color-destructive)";
  const dash = (score / 100) * 264; // 2πr with r=42

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <Card accent="oklch(0.72 0.17 158 / 0.5)">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Income
          </p>
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          {loading || !summary ? <Skeleton /> : (
            <p className="text-3xl font-semibold tracking-tight tabular-nums text-primary">
              {fmt(summary.totalIncome)}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Credits received this period</p>
        </div>
      </Card>

      <Card accent="oklch(0.68 0.22 25 / 0.45)">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Expenses
          </p>
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-destructive/15 text-destructive">
            <ArrowDownRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          {loading || !summary ? <Skeleton /> : (
            <p className="text-3xl font-semibold tracking-tight tabular-nums text-destructive">
              {fmt(summary.totalExpense)}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Debits across all categories</p>
        </div>
      </Card>

      <Card accent="oklch(0.65 0.18 268 / 0.5)">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Financial Health
          </p>
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-accent">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-5">
          <div className="relative h-[96px] w-[96px] shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-muted)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${loading ? 0 : dash} 264`}
                style={{ transition: "stroke-dasharray 800ms cubic-bezier(.2,.8,.2,1)" }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-xl font-semibold tabular-nums">
                {loading || !summary ? "—" : score}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">
              {score >= 75 ? "Excellent" : score >= 50 ? "Steady" : score > 0 ? "Needs attention" : "—"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Out of 100 · AI-scored</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
