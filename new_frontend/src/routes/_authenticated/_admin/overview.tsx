import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, FileText, Receipt, Brain } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/_admin/overview")({
  component: AdminOverview,
  head: () => ({ meta: [{ title: "Admin · FinSense" }] }),
});

function AdminOverview() {
  const [m, setM] = useState<{ users: number; statements: number; transactions: number; mlAccuracy: number } | null>(null);
  useEffect(() => { api.adminMetrics().then(setM).catch(() => setM(null)); }, []);
  const items = [
    { icon: Users, label: "Users", value: m?.users },
    { icon: FileText, label: "Statements", value: m?.statements },
    { icon: Receipt, label: "Transactions", value: m?.transactions },
    { icon: Brain, label: "ML accuracy", value: m ? `${(m.mlAccuracy * 100).toFixed(1)}%` : undefined },
  ];
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform-wide metrics.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
            <i.icon className="h-5 w-5 text-primary" />
            <div className="mt-3 text-2xl font-semibold">{i.value ?? "—"}</div>
            <div className="text-xs text-muted-foreground">{i.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
