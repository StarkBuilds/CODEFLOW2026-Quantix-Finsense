export type Tx = {
  id: number;
  date: string;
  narration: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  category: string;
  transactionHash: string;
};

export type Summary = {
  totalIncome: number;
  totalExpense: number;
  healthScore: number;
};
