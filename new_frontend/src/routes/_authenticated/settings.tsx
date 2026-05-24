import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsLayout,
  head: () => ({ meta: [{ title: "Settings · FinSense" }] }),
});

const tabs = [
  { to: "/settings/profile", label: "Profile" },
  { to: "/settings/security", label: "Security" },
  { to: "/settings/appearance", label: "Appearance" },
] as const;

function SettingsLayout() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <nav className="mt-6 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <Link key={t.to} to={t.to}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent -mb-px"
            activeProps={{ className: "text-foreground border-primary" }}>
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8"><Outlet /></div>
    </div>
  );
}
