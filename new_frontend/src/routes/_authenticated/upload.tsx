import { createFileRoute } from "@tanstack/react-router";
import { UploadZone } from "@/components/finsense/UploadZone";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/upload")({
  component: UploadPage,
  head: () => ({ meta: [{ title: "Upload Statement · FinSense" }] }),
});

function UploadPage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Upload a statement</h1>
      <p className="mt-2 text-sm text-muted-foreground">Drop a CSV or PDF. We'll parse, categorize and hash each transaction.</p>
      <div className="mt-8">
        <UploadZone onSuccess={() => navigate({ to: "/dashboard" })} />
      </div>
    </div>
  );
}
