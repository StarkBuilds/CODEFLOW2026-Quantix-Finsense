export interface StatementAnalysisResponse {
  summary: {
    aiOverview: string;      // The 3-4 sentence paragraph written by Gemini
    transactionCount: number;
    totalIncome: number;
    totalExpense: number;
    breakdown: Record<string, number>; // Calculated category distributions
  };
  transactions: Array<{
    date: string;
    narration: string;
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    category: string;        // Assigned locally by your XGBoost model
  }>;
}

/**
 * Uploads a physical bank statement directly to the Spring Boot microservice pipeline.
 */
export const uploadBankStatement = async (file: File, password?: string): Promise<StatementAnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (password) {
    formData.append('password', password);
  }

  // Targets your Java Controller endpoint
  const response = await fetch('http://localhost:8080/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload processing failed with code: ${response.status}`);
  }

  return await response.json();
};