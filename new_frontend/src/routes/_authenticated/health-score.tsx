import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/health-score")({
  component: HealthScorePage,
  head: () => ({ meta: [{ title: "Financial Health Score · FinSense" }] }),
});

function HealthScorePage() {
  const [data, setData] = useState<{ score: number; breakdown: Array<{ label: string; value: number; weight: number }> } | null>(null);
  useEffect(() => { api.getHealthScore().then(setData).catch(() => setData(null)); }, []);

  const score = data?.score ?? 0;
  const ring = `conic-gradient(var(--color-primary) ${score * 3.6}deg, var(--color-secondary) 0)`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Financial Health Score</h1>
        <p className="mt-1 text-sm text-muted-foreground">A holistic look at your spending discipline, savings and debt.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="grid place-items-center">
          <div className="grid h-44 w-44 place-items-center rounded-full" style={{ background: ring }}>
            <div className="grid h-36 w-36 place-items-center rounded-full bg-card">
              <div className="text-center">
                <div className="text-4xl font-semibold">{score}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">out of 100</div>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur">
          <h3 className="text-sm font-semibold">Breakdown</h3>
          <div className="mt-4 space-y-4">
            {(data?.breakdown ?? []).map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs"><span>{b.label}</span><span className="text-muted-foreground">{b.value}% (weight {b.weight}×)</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${b.value}%` }} />
                </div>
              </div>
            ))}
            {!data && <p className="text-sm text-muted-foreground">Connect your backend to see your breakdown.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
