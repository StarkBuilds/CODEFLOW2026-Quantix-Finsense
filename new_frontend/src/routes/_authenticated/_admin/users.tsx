import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/_admin/users")({
  component: AdminUsers,
  head: () => ({ meta: [{ title: "Admin · Users" }] }),
});

function AdminUsers() {
  const [users, setUsers] = useState<Array<{ id: string; email: string; role: string; createdAt: string; statements: number }>>([]);
  useEffect(() => { api.adminListUsers().then(setUsers).catch(() => setUsers([])); }, []);
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-right">Statements</th><th className="px-4 py-3 text-right">Joined</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{u.role}</span></td>
                <td className="px-4 py-3 text-right tabular-nums">{u.statements}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No users loaded.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
