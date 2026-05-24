import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Copy, ShieldCheck } from "lucide-react";
import type { Tx } from "@/lib/finsense-types";
import { toast } from "sonner";

const CATEGORY_STYLES: Record<string, string> = {
  Food: "bg-[oklch(0.78_0.16_70_/_0.15)] text-[oklch(0.85_0.16_70)] ring-[oklch(0.78_0.16_70_/_0.3)]",
  Transport: "bg-[oklch(0.7_0.15_210_/_0.15)] text-[oklch(0.8_0.15_210)] ring-[oklch(0.7_0.15_210_/_0.3)]",
  EMI: "bg-[oklch(0.68_0.22_25_/_0.15)] text-[oklch(0.8_0.22_25)] ring-[oklch(0.68_0.22_25_/_0.3)]",
  Shopping: "bg-[oklch(0.68_0.17_320_/_0.15)] text-[oklch(0.82_0.17_320)] ring-[oklch(0.68_0.17_320_/_0.3)]",
  Entertainment: "bg-[oklch(0.65_0.18_268_/_0.15)] text-[oklch(0.8_0.18_268)] ring-[oklch(0.65_0.18_268_/_0.3)]",
  Income: "bg-[oklch(0.72_0.17_158_/_0.15)] text-[oklch(0.85_0.17_158)] ring-[oklch(0.72_0.17_158_/_0.3)]",
  Bills: "bg-[oklch(0.78_0.16_70_/_0.15)] text-[oklch(0.85_0.16_70)] ring-[oklch(0.78_0.16_70_/_0.3)]",
};
const NEUTRAL = "bg-muted text-muted-foreground ring-border";

const fmtAmount = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const fmtDate = (s: string) => {
  const d = new Date(s);
  return isNaN(+d) ? s : d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

export function TransactionTable({ transactions, loading }: { transactions: Tx[]; loading: boolean }) {
  const [hoverHash, setHoverHash] = useState<number | null>(null);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Transaction Ledger</h3>
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading…" : `${transactions.length} transactions · cryptographically verified`}
          </p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground sm:inline-flex">
          <ShieldCheck className="h-3 w-3 text-primary" /> SHA-256 secured
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-center font-medium">Hash</th>
            </tr>
          </thead>
          <tbody>
            {loading && transactions.length === 0 && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-sm text-muted-foreground">
                  No transactions yet — upload a statement to get started.
                </td>
              </tr>
            )}
            {transactions.map((t) => {
              const cat = t.category || "Uncategorized";
              const catStyle = CATEGORY_STYLES[cat] ?? NEUTRAL;
              const isCredit = t.type === "CREDIT";
              return (
                <tr key={t.id} className="group border-b border-border/60 transition-colors hover:bg-secondary/30">
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">{fmtDate(t.date)}</td>
                  <td className="max-w-[320px] px-6 py-4">
                    <div className="truncate font-medium text-foreground">{t.narration}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${catStyle}`}>
                      {cat}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      isCredit
                        ? "bg-primary/10 text-primary ring-primary/30"
                        : "bg-destructive/10 text-destructive ring-destructive/30"
                    }`}>
                      {isCredit ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      {t.type}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums ${
                    isCredit ? "text-primary" : "text-foreground"
                  }`}>
                    {isCredit ? "+" : "−"} {fmtAmount(t.amount)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onMouseEnter={() => setHoverHash(t.id)}
                      onMouseLeave={() => setHoverHash(null)}
                      onClick={() => {
                        navigator.clipboard.writeText(t.transactionHash || "");
                        toast.success("Hash copied to clipboard");
                      }}
                      className="relative inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      title={t.transactionHash}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {hoverHash === t.id && t.transactionHash && (
                        <span className="absolute right-full top-1/2 z-10 mr-2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground shadow-xl">
                          {t.transactionHash.slice(0, 16)}… <Copy className="ml-1 inline h-2.5 w-2.5" />
                        </span>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
