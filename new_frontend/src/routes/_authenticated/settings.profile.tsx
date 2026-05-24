import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/settings/profile")({
  component: ProfileSettings,
});

function ProfileSettings() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Mock user load since custom backend API doesn't specify profile endpoint
    setName(user.email.split("@")[0] || "");
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.info("Profile update not supported on this custom backend yet.");
    }, 1000);
  };

  return (
    <form onSubmit={save} className="max-w-md space-y-4">
      <div className="space-y-1.5"><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
      <div className="space-y-1.5"><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <Button type="submit" disabled={loading}>Save changes</Button>
    </form>
  );
}
