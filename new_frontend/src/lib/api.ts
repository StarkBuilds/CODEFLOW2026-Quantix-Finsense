// Thin wrapper around the Spring Boot backend.
// All ML/transaction endpoints are proxied through this client so we can swap
// the base URL or attach the JWT in one place.

export const API_BASE = (import.meta.env.VITE_FINSENSE_API as string | undefined) ?? "http://localhost:8080/api";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("finsense_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isFormData = init.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...authHeaders(),
    ...(init.headers ?? {}),
  };
  
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const errBody = await res.json();
      if (errBody.message) msg = errBody.message;
      else if (errBody.error) msg = errBody.error;
    } catch (e) {
      // Ignore
    }
    if (res.status === 401 || res.status === 423) {
      throw new ApiError(res.status, msg);
    }
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // Statements & ingestion
  uploadStatement: async (file: File, password?: string) => {
    const fd = new FormData();
    fd.append("file", file);
    if (password) fd.append("password", password);
    
    return request<any>("/upload", {
      method: "POST",
      body: fd,
    });
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
