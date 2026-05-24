import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TransactionTable } from "@/components/finsense/TransactionTable";
import { api } from "@/lib/api";
import type { Tx } from "@/lib/finsense-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, RefreshCw, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/transactions")({
  component: TransactionsPage,
  head: () => ({ meta: [{ title: "Transactions · FinSense" }] }),
});

type Filter = "ALL" | "CREDIT" | "DEBIT";

function TransactionsPage() {
  const [txs, setTxs]         = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]             = useState("");
  const [filter, setFilter]   = useState<Filter>("ALL");

  const load = () => {
    setLoading(true);
    api.listTransactions()
      .then((d) => setTxs(d as Tx[]))
      .catch(() => setTxs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = txs.filter((t) => {
    const matchQ   = !q || t.narration.toLowerCase().includes(q.toLowerCase()) || (t.category ?? "").toLowerCase().includes(q.toLowerCase());
    const matchType = filter === "ALL" || t.type === filter;
    return matchQ && matchType;
  });

  const totalCredit = filtered.filter((t) => t.type === "CREDIT").reduce((s, t) => s + t.amount, 0);
  const totalDebit  = filtered.filter((t) => t.type === "DEBIT").reduce((s, t) => s + t.amount, 0);
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <ShieldCheck className="inline h-3.5 w-3.5 mr-1 text-primary" />
            {txs.length.toLocaleString()} total · SHA-256 cryptographically secured
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2 shrink-0">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Summary mini-cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Shown", value: filtered.length.toLocaleString(), accent: "text-foreground" },
          { label: "Credits", value: fmt(totalCredit), accent: "text-primary" },
          { label: "Debits",  value: fmt(totalDebit),  accent: "text-destructive" },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card/60 px-4 py-3 backdrop-blur"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={`mt-1 text-xl font-semibold tabular-nums ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search narration or category…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground mx-1" />
          {(["ALL", "CREDIT", "DEBIT"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === f
                  ? f === "CREDIT" ? "bg-primary text-primary-foreground"
                    : f === "DEBIT"  ? "bg-destructive text-destructive-foreground"
                    : "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "ALL" ? "All" : f === "CREDIT" ? "Credits" : "Debits"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <TransactionTable transactions={filtered} loading={loading} />
    </div>
  );
}
