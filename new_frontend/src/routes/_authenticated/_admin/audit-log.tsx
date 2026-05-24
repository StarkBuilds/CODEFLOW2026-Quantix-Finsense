import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/_admin/audit-log")({
  component: AuditLog,
  head: () => ({ meta: [{ title: "Admin · Audit Log" }] }),
});

function AuditLog() {
  const [chain, setChain] = useState<Array<{ index: number; hash: string; prevHash: string; txId: number; timestamp: string }>>([]);
  useEffect(() => { api.getAuditChain().then(setChain).catch(() => setChain([])); }, []);
  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2"><ShieldCheck className="h-7 w-7 text-primary" /> Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">Hash-chained record of every transaction event. Tamper-evident.</p>
      </div>
      <div className="rounded-2xl border border-border bg-card/60 p-2 backdrop-blur">
        {chain.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No audit events available.</div>
        ) : chain.map((e) => (
          <div key={e.index} className="px-4 py-3 border-b border-border last:border-0 text-xs font-mono">
            <div className="flex justify-between"><span className="text-muted-foreground">#{e.index} · tx {e.txId}</span><span className="text-muted-foreground">{new Date(e.timestamp).toLocaleString()}</span></div>
            <div className="mt-1 truncate"><span className="text-muted-foreground">hash:</span> {e.hash}</div>
            <div className="truncate"><span className="text-muted-foreground">prev:</span> {e.prevHash}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
