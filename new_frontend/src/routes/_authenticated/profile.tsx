import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  User, Mail, KeyRound, ShieldCheck, LogOut, Sparkles,
} from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile & Security · FinSense" }] }),
});

function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  /* Password change state */
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [pwLoading,  setPwLoading]  = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPw.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPwLoading(true);
    try {
      // NOTE: Password update endpoint needs to be implemented on the Spring Boot backend
      toast.info("Password update not supported on this custom backend yet.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Password update failed");
    } finally {
      setPwLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: "/" });
  };

  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profile & Security</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account details and password.
        </p>
      </div>

      {/* Profile card */}
      <div
        className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl space-y-5"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-semibold text-primary-foreground shadow-[0_0_20px_-4px_oklch(0.65_0.18_268_/_0.5)]">
            {initials}
            <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-background bg-primary">
              <Sparkles className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
          </div>
          <div>
            <div className="font-semibold text-sm">{user?.email}</div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Verified account
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </label>
            <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
              {user?.email}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> User ID
            </label>
            <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground font-mono truncate">
              {user?.id ?? "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Password change card */}
      <div
        className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="mb-5 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Current Password</label>
            <Input
              type="password"
              placeholder="Current password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">New Password</label>
            <Input
              type="password"
              placeholder="Min. 8 characters"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
            <Input
              type="password"
              placeholder="Repeat new password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={pwLoading} className="w-full">
            {pwLoading ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="text-sm font-semibold text-destructive mb-3">Sign Out</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Sign out from this device. Your data stays safe.
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleSignOut}
          className="gap-2"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </Button>
      </div>

    </div>
  );
}
