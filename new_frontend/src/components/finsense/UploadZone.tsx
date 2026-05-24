import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

// ── Added a robust TypeScript schema definition matching our new Java/Flask outputs ──
export interface StatementAnalysisBundle {
  summary: {
    aiOverview: string;      // The summary written by Gemini
    transactionCount: number;
    totalIncome: number;
    totalExpense: number;
    breakdown: Record<string, number>;
  };
  transactions: Array<{
    date: string;
    narration: string;
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    category: string;        // Assigned locally by XGBoost
  }>;
}

// Updated the prop callback type to pass this complete dataset out to the dashboard panel layout
export function UploadZone({ onSuccess }: { onSuccess: (data: StatementAnalysisBundle) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const ok = /\.(csv|pdf)$/i.test(file.name);
      if (!ok) {
        toast.error("Only .csv and .pdf files are supported");
        return;
      }
      setFileName(file.name);
      setUploading(true);
      try {
        const data = await api.uploadStatement(file);
        
        // Sweet custom notification using the real summary metrics extracted live by your pipeline
        toast.success("Analysis complete", {
          description: `Processed ${data.summary?.transactionCount ?? 0} transactions via local XGBoost model.`,
        });
        
        // Passes the entire asset bundle back to your main panel context structure
        onSuccess(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        toast.error(msg);
      } finally {
        setUploading(false);
      }
    },
    [onSuccess],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-dashed bg-card/40 p-10 backdrop-blur-xl transition-all hover:bg-card/60 ${
        dragging ? "border-accent bg-accent/5 ring-2 ring-accent/40" : "border-border"
      }`}
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-col items-center text-center">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent/30 to-primary/20 ring-1 ring-white/10">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          ) : (
            <Upload className="h-6 w-6 text-accent transition-transform group-hover:-translate-y-0.5" />
          )}
        </div>

        {uploading ? (
          <>
            <h3 className="text-base font-semibold tracking-tight">
              AI is analyzing transactions…
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {fileName} — parsing, categorizing & hashing
            </p>
            <div className="mt-5 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/2 animate-[shimmer_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-accent via-primary to-accent" />
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold tracking-tight">
              Drop your bank statement
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Drag & drop a <span className="text-foreground">.csv</span> or{" "}
              <span className="text-foreground">.pdf</span> file, or click to browse.
              We'll parse, categorize and secure each transaction.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1">
                <FileText className="h-3 w-3" /> CSV / PDF
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1">
                <ShieldCheck className="h-3 w-3 text-primary" /> SHA-256 hashed
              </span>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
    </div>
  );
}