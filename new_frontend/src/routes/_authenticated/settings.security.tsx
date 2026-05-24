import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/settings/security")({
  component: SecuritySettings,
});

function SecuritySettings() {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return toast.error("At least 8 characters");
    setLoading(true);
    // Simulate updating password
    setTimeout(() => {
      setLoading(false);
      setPw("");
      toast.info("Password update not supported on this custom backend yet.");
    }, 1000);
  };

  return (
    <form onSubmit={save} className="max-w-md space-y-4">
      <div className="space-y-1.5"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
      <Button type="submit" disabled={loading}>Update password</Button>
    </form>
  );
}
