import { Link, Outlet, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Receipt,
  Sparkles,
  LogOut,
  User as UserIcon,
  Shield,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/finsense/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* Core nav — 3 pages only as planned */
const NAV = [
  { to: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/insights",     label: "AI Insights",  icon: Sparkles },
];

const ADMIN_NAV = [
  { to: "/admin/overview",   label: "Overview",   icon: Shield },
  { to: "/admin/users",      label: "Users",      icon: UserIcon },
  { to: "/admin/ml-monitor", label: "ML Monitor", icon: Activity },
  { to: "/admin/audit-log",  label: "Audit Log",  icon: ShieldCheck },
];

export function AppShell() {
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  const onSignOut = async () => {
    await signOut();
    router.navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Sidebar (desktop) ─────────────────────────────── */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-border bg-sidebar/60 backdrop-blur-xl sticky top-0 h-screen">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-[0_0_16px_-4px_oklch(0.65_0.18_268_/_0.5)]">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">FinSense</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">AI Analyzer</div>
            </div>
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
            >
              <n.icon className="h-4 w-4 shrink-0" />
              {n.label}
            </Link>
          ))}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="mt-6 mb-1 px-3 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Admin
              </div>
              {ADMIN_NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
                >
                  <n.icon className="h-4 w-4 shrink-0" />
                  {n.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[11px] font-semibold text-primary-foreground shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{user?.email}</div>
              <div className="text-[10px] text-muted-foreground">Signed in</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-3">

            {/* Mobile logo */}
            <Link to="/dashboard" className="lg:hidden flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-accent">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">FinSense</span>
            </Link>

            {/* Mobile nav links */}
            <nav className="lg:hidden flex items-center gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  activeProps={{ className: "text-primary font-medium" }}
                >
                  <n.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{n.label}</span>
                </Link>
              ))}
            </nav>

            {/* Status pill — desktop */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground rounded-full border border-border bg-secondary/60 px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Connected · localhost:8080
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-2">
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[11px] font-semibold text-primary-foreground">
                      {initials}
                    </div>
                    <span className="hidden sm:inline text-sm max-w-[160px] truncate">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground truncate">{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile"><UserIcon className="mr-2 h-4 w-4" /> Profile & Security</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
