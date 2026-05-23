/* ─── Category color palette ─────────────────────────────────────────────── */
export const CAT_COLORS = {
  'Food & Dining':  '#f97316',
  'Shopping':       '#a855f7',
  'Travel':         '#3b82f6',
  'Entertainment':  '#ec4899',
  'Utilities':      '#0891b2',
  'Healthcare':     '#e11d48',
  'Salary':         '#16a34a',
  'UPI Transfer':   '#6366f1',
  'Rent & Housing': '#d97706',
  'Subscriptions':  '#7c3aed',
  'EMI & Loans':    '#dc2626',
  'Groceries':      '#65a30d',
  'Fuel':           '#0284c7',
  'Investment':     '#059669',
  'Refund':         '#0d9488',
  'Other':          '#64748b',
};

export const CAT_LIST = Object.keys(CAT_COLORS);

/* ─── Claude system prompt ───────────────────────────────────────────────── */
export const SYSTEM_PROMPT = `You are a financial analyst specialising in Indian bank statements.
Analyse the provided data and return ONLY valid JSON (NO markdown fences, NO text outside JSON) matching this EXACT schema:

{
  "transactions": [
    {
      "id": 1,
      "date": "DD/MM/YYYY",
      "narration": "string",
      "debit": 0,
      "credit": 0,
      "balance": 0,
      "category": "Food & Dining",
      "isRecurring": false,
      "isUnusual": false
    }
  ],
  "summary": {
    "totalIncome": 0,
    "totalExpenses": 0,
    "netSavings": 0,
    "savingsRate": 0,
    "transactionCount": 0,
    "topCategory": "string",
    "financialHealthScore": 75,
    "openingBalance": 0,
    "closingBalance": 0,
    "period": "Apr 2024 - May 2024"
  },
  "categoryBreakdown": [
    { "name": "string", "amount": 0, "count": 0, "percentage": 0 }
  ],
  "monthlyTrend": [
    { "month": "Apr 2024", "income": 0, "expense": 0 }
  ],
  "recurringPayments": [
    { "narration": "string", "amount": 0, "frequency": "Monthly", "category": "string" }
  ],
  "unusualTransactions": [
    { "date": "string", "narration": "string", "amount": 0, "reason": "string" }
  ],
  "incomeStreams": [
    { "source": "string", "amount": 0, "frequency": "Monthly" }
  ],
  "aiSummary": "2–3 paragraph financial analysis",
  "recommendations": [
    { "title": "string", "description": "string", "priority": "high", "icon": "emoji" }
  ]
}

Valid categories ONLY: ${CAT_LIST.join(', ')}.
Health score 0–100 based on savings rate, debt ratio, expense diversity, investment activity.
Scoring bands: 0–40 = Poor, 41–60 = Fair, 61–75 = Good, 76–100 = Excellent.`;

/* ─── Sample CSV for testing ─────────────────────────────────────────────── */
export const SAMPLE_CSV = `Date,Narration,Ref No,Value Date,Withdrawal Amt,Deposit Amt,Closing Balance
01/04/2024,SALARY CREDIT ACME CORP,,01/04/2024,,85000.00,95000.00
02/04/2024,ZOMATO*ORDER 9812,,02/04/2024,450.00,,94550.00
03/04/2024,AMAZON.IN PURCHASE,,03/04/2024,2399.00,,92151.00
05/04/2024,NETFLIX SUBSCRIPTION,,05/04/2024,649.00,,91502.00
07/04/2024,SWIGGY ORDER,,07/04/2024,380.00,,91122.00
10/04/2024,HDFC CREDITCARD EMI,,10/04/2024,8500.00,,82622.00
12/04/2024,PETROL BPCL 1204,,12/04/2024,3000.00,,79622.00
14/04/2024,ZOMATO*ORDER 3421,,14/04/2024,520.00,,79102.00
15/04/2024,SIP INVESTMENT AXIS MF,,15/04/2024,5000.00,,74102.00
18/04/2024,BIGBASKET GROCERY,,18/04/2024,2100.00,,72002.00
20/04/2024,RENT TRANSFER UPI,,20/04/2024,22000.00,,50002.00
22/04/2024,IRCTC BOOKING,,22/04/2024,3400.00,,46602.00
25/04/2024,AMAZON.IN PURCHASE,,25/04/2024,5999.00,,40603.00
26/04/2024,FREELANCE PAYMENT,,26/04/2024,,15000.00,55603.00
28/04/2024,SPOTIFY PREMIUM,,28/04/2024,199.00,,55404.00
30/04/2024,APOLLO PHARMACY,,30/04/2024,850.00,,54554.00
01/05/2024,SALARY CREDIT ACME CORP,,01/05/2024,,85000.00,139554.00
03/05/2024,ZOMATO*ORDER 5671,,03/05/2024,650.00,,138904.00
05/05/2024,HDFC CREDITCARD EMI,,05/05/2024,8500.00,,130404.00
08/05/2024,SWIGGY ORDER,,08/05/2024,420.00,,129984.00
10/05/2024,NETFLIX SUBSCRIPTION,,10/05/2024,649.00,,129335.00
12/05/2024,PETROL BPCL 4512,,12/05/2024,2500.00,,126835.00
15/05/2024,SIP INVESTMENT AXIS MF,,15/05/2024,5000.00,,121835.00
18/05/2024,AMAZON.IN PURCHASE,,18/05/2024,3299.00,,118536.00
20/05/2024,RENT TRANSFER UPI,,20/05/2024,22000.00,,96536.00
22/05/2024,BIGBASKET GROCERY,,22/05/2024,1850.00,,94686.00
25/05/2024,MYNTRA PURCHASE,,25/05/2024,4599.00,,90087.00
28/05/2024,SPOTIFY PREMIUM,,28/05/2024,199.00,,89888.00
30/05/2024,FREELANCE PAYMENT,,30/05/2024,,12000.00,101888.00
31/05/2024,ATM WITHDRAWAL,,31/05/2024,5000.00,,96888.00`;