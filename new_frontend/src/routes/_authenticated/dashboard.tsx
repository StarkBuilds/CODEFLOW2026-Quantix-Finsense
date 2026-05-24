import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle, ArrowRight, Sparkles, TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { UploadZone } from "@/components/finsense/UploadZone";
import { KpiCards } from "@/components/finsense/KpiCards";
import { ExpenseDonut, IncomeExpenseBar } from "@/components/finsense/Charts";
import { TransactionTable } from "@/components/finsense/TransactionTable";
import { api } from "@/lib/api";
import type { Summary, Tx } from "@/lib/finsense-types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard · FinSense" }] }),
});

type Insight = {
  id: string;
  type: string;
  title: string;
  body: string;
  severity: "info" | "warn" | "good";
};

const INSIGHT_COLORS = {
  info: "border-accent/30 bg-accent/10 text-accent",
  warn: "border-warning/40 bg-warning/10 text-warning",
  good: "border-primary/40 bg-primary/10 text-primary",
};
const INSIGHT_ICONS = {
  info: Sparkles,
  warn: AlertTriangle,
  good: TrendingUp,
};

function Dashboard() {
  const [summary, setSummary]           = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [insights, setInsights]         = useState<Insight[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, t, ins] = await Promise.all([
        api.getSummary(),
        api.listTransactions(),
        api.getInsights().catch(() => [] as Insight[]),
      ]);
      setSummary(s);
      setTransactions(t as Tx[]);
      setInsights(ins as Insight[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">

      {/* ── Hero + Upload ────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Hero copy */}
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-primary" />
            Hackathon build · CODEFLOW 2026
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
            Understand your money,
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              in seconds.
            </span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Drop a bank statement and FinSense parses, categorizes and
            cryptographically hashes every transaction — surfacing your real
            financial health score.
          </p>
        </div>

        {/* Upload zone */}
        <UploadZone onSuccess={fetchAll} />
      </section>

      {/* ── API error banner ─────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium">Couldn't reach the API</div>
            <div className="text-xs opacity-80">
              {error}. Make sure your Spring Boot backend is running on port 8080.
            </div>
          </div>
        </div>
      )}

      {/* ── KPI Cards (clickable → /transactions) ───────── */}
      <section>
        <KpiCards summary={summary} loading={loading} />
      </section>

      {/* ── Charts ───────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <ExpenseDonut transactions={transactions} />
        <IncomeExpenseBar summary={summary} transactions={transactions} />
      </section>

      {/* ── Recent Transactions (preview, 10 rows) ───────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Recent Transactions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last {Math.min(transactions.length, 10)} of {transactions.length} total
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-primary">
            <Link to="/transactions">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <TransactionTable transactions={transactions.slice(0, 10)} loading={loading} />
      </section>

      {/* ── AI Insights preview (3 cards) ────────────────── */}
      {(insights.length > 0 || !loading) && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">AI Insights</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Narrative findings from your transaction history
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-primary">
              <Link to="/insights">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {insights.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Upload a statement to generate AI insights.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {insights.slice(0, 3).map((ins) => {
                const Icon = INSIGHT_ICONS[ins.severity];
                return (
                  <div
                    key={ins.id}
                    className={`rounded-2xl border p-5 ${INSIGHT_COLORS[ins.severity]}`}
                    style={{ boxShadow: "var(--shadow-elegant)" }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{ins.title}</div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{ins.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border pt-8 pb-4 text-center text-xs text-muted-foreground">
        FinSense · Built with trust, transparency and SHA-256. · Quantix · CODEFLOW 2026
      </footer>
    </div>
  );
}
