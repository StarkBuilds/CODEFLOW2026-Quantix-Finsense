import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Tag } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Cat = { name: string; color?: string; isSystem: boolean };

export const Route = createFileRoute("/_authenticated/categories")({
  component: CategoriesPage,
  head: () => ({ meta: [{ title: "Categories · FinSense" }] }),
});

function CategoriesPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [name, setName] = useState("");
  const load = () => api.listCategories().then((d) => setCats(d as Cat[])).catch(() => setCats([]));
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try { await api.createCategory(name.trim()); setName(""); load(); toast.success("Category added"); }
    catch { toast.error("Could not add category"); }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage how transactions are grouped. Custom categories train the ML model.</p>
      </div>

      <form onSubmit={add} className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Investments" />
        <Button type="submit"><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </form>

      <div className="rounded-2xl border border-border bg-card/60 p-2 backdrop-blur">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {cats.map((c) => (
            <div key={c.name} className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-secondary/60">
              <div className="flex items-center gap-2.5"><Tag className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{c.name}</span></div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.isSystem ? "System" : "Custom"}</span>
            </div>
          ))}
          {cats.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No categories loaded.</div>}
        </div>
      </div>
    </div>
  );
}
