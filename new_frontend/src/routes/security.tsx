import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, FileCheck2, KeyRound, Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/finsense/ThemeToggle";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
  head: () => ({
    meta: [
      { title: "Security & Trust · FinSense" },
      { name: "description", content: "How FinSense protects your bank data: SHA-256 hash chains, row-level security, end-to-end encryption." },
    ],
  }),
});

function SecurityPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">FinSense</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" variant="outline"><Link to="/login">Sign in</Link></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Trust & Security
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">Your bank data, locked down.</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          FinSense is built on four security pillars. Every transaction you upload is verified, isolated and tamper-evident.
        </p>

        <div className="mt-12 space-y-6">
          {[
            { icon: KeyRound, title: "SHA-256 per transaction", desc: "Each parsed transaction is hashed with SHA-256 covering date, amount, narration and account. You can verify the hash from the ledger UI at any time." },
            { icon: FileCheck2, title: "Hash-chained audit log", desc: "Every state change links to the previous hash — blockchain-style. Tampering with one record invalidates the whole chain, instantly visible to admins." },
            { icon: Database, title: "Row-level security", desc: "Database access is enforced server-side. You can only ever see your own statements; no client query can leak another user's data." },
            { icon: Lock, title: "Encrypted at rest & in transit", desc: "Statements and computed data are encrypted both in storage and over the wire. JWTs are short-lived; refresh tokens rotate." },
          ].map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <p.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-8 text-center">
          <h2 className="text-2xl font-semibold">Ready to try it?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign up free and upload your first statement.</p>
          <Button asChild className="mt-5"><Link to="/register">Create account</Link></Button>
        </div>
      </main>
    </div>
  );
}
