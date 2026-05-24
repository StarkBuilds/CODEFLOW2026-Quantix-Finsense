// Thin wrapper around the Spring Boot ML backend.
// All ML/transaction endpoints are proxied through this client so we can swap
// the base URL or attach the Supabase JWT in one place.
import { supabase } from "@/integrations/supabase/client";

export const API_BASE = (import.meta.env.VITE_FINSENSE_API as string | undefined) ?? "http://localhost:8080/api";

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
    ...(init.headers ?? {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) throw new ApiError(res.status, `${res.status} ${res.statusText}`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // Statements & ingestion
  uploadStatement: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: await authHeaders(),
      body: fd,
    });
    if (!res.ok) throw new ApiError(res.status, "Upload failed");
    return res.json();
  },
  listStatements: () => request<Array<{ id: string; filename: string; uploadedAt: string; transactionCount: number }>>("/statements"),

  // Dashboard
  getSummary: () => request<{ totalIncome: number; totalExpense: number; healthScore: number }>("/dashboard/summary"),
  getHealthScore: () =>
    request<{ score: number; breakdown: Array<{ label: string; value: number; weight: number }> }>("/health-score"),

  // Transactions
  listTransactions: (params: Record<string, string | number | undefined> = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "") as [string, string][],
    ).toString();
    return request<Array<{
      id: number;
      date: string;
      narration: string;
      amount: number;
      type: "DEBIT" | "CREDIT";
      category: string;
      transactionHash: string;
    }>>(`/transactions${qs ? `?${qs}` : ""}`);
  },
  updateTxCategory: (id: number, category: string) =>
    request<unknown>(`/transactions/${id}/category`, { method: "PATCH", body: JSON.stringify({ category }) }),
  verifyTxHash: (id: number) => request<{ valid: boolean; expected: string; actual: string }>(`/transactions/${id}/verify`, { method: "POST" }),

  // Insights / ML
  getInsights: () => request<Array<{ id: string; type: string; title: string; body: string; severity: "info" | "warn" | "good" }>>("/insights"),
  getAnomalies: () => request<Array<{ id: string; txId: number; reason: string; score: number }>>("/insights/anomalies"),

  // Categories
  listCategories: () => request<Array<{ name: string; color?: string; isSystem: boolean }>>("/categories"),
  createCategory: (name: string) => request<unknown>("/categories", { method: "POST", body: JSON.stringify({ name }) }),

  // ML
  getModelInfo: () => request<{ version: string; accuracy: number; lastTrained: string; samples: number }>("/ml/model-info"),
  submitFeedback: (txId: number, correctCategory: string) =>
    request<unknown>("/ml/feedback", { method: "POST", body: JSON.stringify({ txId, correctCategory }) }),
  recategorize: () => request<{ updated: number }>("/ml/recategorize", { method: "POST" }),

  // Audit
  getAuditChain: () => request<Array<{ index: number; hash: string; prevHash: string; txId: number; timestamp: string }>>("/audit/chain"),

  // Admin
  adminMetrics: () =>
    request<{ users: number; statements: number; transactions: number; mlAccuracy: number }>("/admin/metrics"),
  adminListUsers: () =>
    request<Array<{ id: string; email: string; role: string; createdAt: string; statements: number }>>("/admin/users"),
  adminRetrain: () => request<{ jobId: string }>("/admin/ml/retrain", { method: "POST" }),
  adminDrift: () =>
    request<{ drift: number; categories: Array<{ name: string; confidence: number }> }>("/admin/ml/drift"),
};
