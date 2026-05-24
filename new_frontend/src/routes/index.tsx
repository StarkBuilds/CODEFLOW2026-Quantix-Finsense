import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, ShieldCheck, Brain, Upload, ArrowRight,
  Lock, LineChart, Zap, Check, TrendingUp, Activity,
  FileText, Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/finsense/ThemeToggle";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "FinSense — Understand your money in seconds" },
      { name: "description", content: "AI-powered bank statement analyzer with cryptographic verification, instant categorization, and a real financial health score." },
      { property: "og:title", content: "FinSense — AI Bank Statement Analyzer" },
      { property: "og:description", content: "Upload a statement. Get insights, categorization, and a health score in seconds." },
    ],
  }),
});

/* ── Feature cards data ────────────────────────────────────── */
const FEATURES = [
  {
    Icon: Brain,
    title: "AI categorization",
    desc: "Every transaction tagged automatically. Food, EMI, salary, subscriptions — sorted in milliseconds.",
  },
  {
    Icon: LineChart,
    title: "Health score",
    desc: "A single, honest number that summarizes your savings, debt and spending discipline.",
  },
  {
    Icon: ShieldCheck,
    title: "Cryptographic proof",
    desc: "SHA-256 hashes every record and chains them. Tamper-evident from upload to dashboard.",
  },
];

const PILLARS = [
  { Icon: Upload,    title: "Parse anything",  desc: "CSV & PDF support"        },
  { Icon: Brain,     title: "ML categorizer",  desc: "Continuously improving"   },
  { Icon: LineChart, title: "Real insights",   desc: "Not just charts"          },
  { Icon: Lock,      title: "Tamper-proof",    desc: "Hash-chained ledger"      },
];

const CHECKLIST = [
  "Unlimited uploads",
  "Cryptographic audit log",
  "AI insights",
  "Light & dark mode",
];

/* ── Stats bar ─────────────────────────────────────────────── */
const STATS = [
  { Icon: TrendingUp, label: "Accuracy", value: "94%" },
  { Icon: Activity,   label: "Categories", value: "15+" },
  { Icon: FileText,   label: "Formats", value: "CSV & PDF" },
  { Icon: Hash,       label: "Security", value: "SHA-256" },
];

function Landing() {
  return (
    <div className="min-h-screen">

      {/* ── Sticky Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_-4px_oklch(0.65_0.18_268_/_0.5)]">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">FinSense</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:block">
                AI Bank Statement Analyzer
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#pillars"  className="transition-colors hover:text-foreground">Security</a>
            <Link to="/security" className="transition-colors hover:text-foreground">Trust</Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
            <Button asChild size="sm"><Link to="/register">Get started</Link></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="py-24 lg:py-36 text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-primary" />
            AI + cryptographic verification
          </span>

          {/* Title — old project's exact copy with green gradient */}
          <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02]">
            Understand your money,
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              in seconds.
            </span>
          </h1>

          {/* Sub — old project copy */}
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground leading-relaxed">
            Drop a bank statement. FinSense parses, categorizes and hashes every transaction —
            giving you a real financial health score and AI-powered insights.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/register">Start free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map(({ Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/40 py-5 backdrop-blur"
                style={{ boxShadow: "var(--shadow-elegant)" }}
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-white/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xl font-semibold tabular-nums">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section id="features" className="py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">What FinSense does</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Everything you need to understand your finances
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
                style={{ boxShadow: "var(--shadow-elegant)" }}
              >
                {/* Glow orb */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl bg-primary" />
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pillars ──────────────────────────────────────────── */}
        <section id="pillars" className="py-20">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Built on four pillars</h2>
            <p className="mt-3 text-sm text-muted-foreground">Trust, transparency, intelligence, and speed.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card/40 p-5 transition-colors hover:border-primary/40 hover:bg-card/70"
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-sm font-semibold">{title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA banner ───────────────────────────────────────── */}
        <section className="my-20 rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-10 md:p-16 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,oklch(0.65_0.18_268_/_0.12),transparent_70%)]" />

          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Ready to see your real numbers?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">Free during the hackathon. No credit card.</p>

          <ul className="mx-auto mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {CHECKLIST.map((x) => (
              <li key={x} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> {x}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link to="/register">Create account</Link>
            </Button>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="border-t border-border py-10 text-center text-xs text-muted-foreground">
          FinSense · Built with trust, transparency and SHA-256. · CODEFLOW 2026 · Quantix
        </footer>

      </main>
    </div>
  );
}
