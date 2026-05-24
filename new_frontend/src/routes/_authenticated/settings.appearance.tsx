import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/settings/appearance")({
  component: AppearanceSettings,
});

const opts = [
  { v: "light", label: "Light", icon: Sun },
  { v: "dark", label: "Dark", icon: Moon },
  { v: "system", label: "System", icon: Monitor },
] as const;

function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="max-w-2xl">
      <h2 className="text-sm font-semibold">Theme</h2>
      <p className="text-sm text-muted-foreground">Choose how FinSense looks.</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {opts.map((o) => {
          const active = theme === o.v;
          return (
            <button key={o.v} onClick={() => setTheme(o.v)}
              className={`rounded-xl border p-5 text-left transition ${active ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"}`}>
              <o.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 text-sm font-medium">{o.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
