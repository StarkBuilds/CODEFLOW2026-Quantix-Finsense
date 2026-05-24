import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Sparkles, AlertTriangle, TrendingUp,
  RefreshCw, Brain, ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/insights")({
  component: InsightsPage,
  head: () => ({ meta: [{ title: "AI Insights · FinSense" }] }),
});

type Insight  = { id: string; type: string; title: string; body: string; severity: "info" | "warn" | "good" };
type Anomaly  = { id: string; txId: number; reason: string; score: number };

const COLORS = {
  info: "border-accent/30 bg-accent/10",
  warn: "border-warning/40 bg-warning/10",
  good: "border-primary/40 bg-primary/10",
};
const ICON_COLOR = {
  info: "text-accent",
  warn: "text-warning",
  good: "text-primary",
};
const ICONS = { info: Sparkles, warn: AlertTriangle, good: TrendingUp };

function InsightsPage() {
  const [insights,  setInsights]  = useState<Insight[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [recatLoad, setRecatLoad] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getInsights().catch(()   => [] as Insight[]),
      api.getAnomalies().catch(()  => [] as Anomaly[]),
    ]).then(([ins, an]) => {
      setInsights(ins as Insight[]);
      setAnomalies(an as Anomaly[]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRecategorize = async () => {
    setRecatLoad(true);
    try {
      const res = await api.recategorize();
      toast.success(`Re-categorized ${(res as { updated: number }).updated} transactions`);
      load();
    } catch {
      toast.error("Recategorize failed — is the ML service running?");
    } finally {
      setRecatLoad(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">AI Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Narrative findings and anomaly detection from your transaction history.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleRecategorize}
            disabled={recatLoad}
            className="gap-2"
          >
            <Brain className="h-3.5 w-3.5" />
            {recatLoad ? "Running…" : "Re-categorize ML"}
          </Button>
        </div>
      </div>

      {/* Insight cards */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Spending Insights
        </h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl border border-border shimmer" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No insights yet. Upload a bank statement to generate AI insights.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((ins) => {
              const Icon = ICONS[ins.severity];
              return (
                <div
                  key={ins.id}
                  className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${COLORS[ins.severity]}`}
                  style={{ boxShadow: "var(--shadow-elegant)" }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 ${ICON_COLOR[ins.severity]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{ins.title}</div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{ins.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Anomaly detection */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-warning" />
          Anomaly Detection
        </h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl border border-border shimmer" />
            ))}
          </div>
        ) : anomalies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No anomalies detected — your transactions look clean.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {anomalies.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-warning/40 bg-warning/10 p-5"
                style={{ boxShadow: "var(--shadow-elegant)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-warning uppercase tracking-wider">
                      Anomaly · TXN #{a.txId}
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{a.reason}</p>
                  </div>
                  <div className="shrink-0 rounded-full border border-warning/40 bg-warning/20 px-2.5 py-1 text-xs font-semibold text-warning tabular-nums">
                    Score {(a.score * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
