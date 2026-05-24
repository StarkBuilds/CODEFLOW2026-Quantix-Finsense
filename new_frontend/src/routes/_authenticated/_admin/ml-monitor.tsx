import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Brain, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/_admin/ml-monitor")({
  component: MLMonitor,
  head: () => ({ meta: [{ title: "Admin · ML Monitor" }] }),
});

function MLMonitor() {
  const [info, setInfo] = useState<{ version: string; accuracy: number; lastTrained: string; samples: number } | null>(null);
  const [drift, setDrift] = useState<{ drift: number; categories: Array<{ name: string; confidence: number }> } | null>(null);
  const [retraining, setRetraining] = useState(false);

  const load = () => {
    api.getModelInfo().then(setInfo).catch(() => setInfo(null));
    api.adminDrift().then(setDrift).catch(() => setDrift(null));
  };
  useEffect(load, []);

  const retrain = async () => {
    setRetraining(true);
    try { const r = await api.adminRetrain(); toast.success(`Retrain queued: ${r.jobId}`); load(); }
    catch { toast.error("Retrain failed"); }
    finally { setRetraining(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">ML Monitor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Model health, drift detection and retraining.</p>
        </div>
        <Button onClick={retrain} disabled={retraining}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${retraining ? "animate-spin" : ""}`} /> Retrain now
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Version", value: info?.version },
          { label: "Accuracy", value: info ? `${(info.accuracy * 100).toFixed(1)}%` : undefined },
          { label: "Samples", value: info?.samples?.toLocaleString() },
          { label: "Last trained", value: info ? new Date(info.lastTrained).toLocaleDateString() : undefined },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-2 text-xl font-semibold">{s.value ?? "—"}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur">
        <div className="flex items-center gap-2 text-sm font-semibold"><Brain className="h-4 w-4 text-primary" /> Per-category confidence</div>
        <div className="mt-4 space-y-3">
          {(drift?.categories ?? []).map((c) => (
            <div key={c.name}>
              <div className="flex justify-between text-xs"><span>{c.name}</span><span className="text-muted-foreground">{(c.confidence * 100).toFixed(0)}%</span></div>
              <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${c.confidence * 100}%` }} />
              </div>
            </div>
          ))}
          {!drift && <p className="text-sm text-muted-foreground">Connect your backend to see drift metrics.</p>}
        </div>
      </div>
    </div>
  );
}
