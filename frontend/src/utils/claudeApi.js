import { SYSTEM_PROMPT } from './constants';
import { readAsBase64, readAsText } from './helpers';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL   = 'claude-sonnet-4-20250514';

/**
 * Analyse a bank statement file using the Claude API.
 *
 * @param {File}     file        - PDF or CSV file uploaded by the user
 * @param {Function} onProgress  - Callback(message: string) for progress updates
 * @returns {Promise<Object>}    - Parsed analysis JSON
 */
export const analyzeStatement = async (file, onProgress) => {
  const isPDF = file.name.toLowerCase().endsWith('.pdf');

  onProgress('Reading file…');

  /* ── Build the request messages ────────────────────────────────────────── */
  let messages;

  if (isPDF) {
    onProgress('Encoding PDF for AI analysis…');
    const b64 = await readAsBase64(file);

    messages = [
      {
        role: 'user',
        content: [
          {
            type:   'document',
            source: { type: 'base64', media_type: 'application/pdf', data: b64 },
          },
          {
            type: 'text',
            text: 'Extract and analyse all transactions from this Indian bank statement. Return JSON only.',
          },
        ],
      },
    ];
  } else {
    onProgress('Parsing CSV data…');
    const text = await readAsText(file);

    messages = [
      {
        role:    'user',
        content: `Analyse this Indian bank statement CSV:\n\n${text.slice(0, 60000)}\n\nReturn JSON only as specified.`,
      },
    ];
  }

  /* ── Call the Claude API ────────────────────────────────────────────────── */
  onProgress('AI extracting & categorising transactions…');

  const response = await fetch(API_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 8000,
      system:     SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(
      `API error ${response.status}${errText ? ': ' + errText.slice(0, 150) : ''}`
    );
  }

  /* ── Parse & normalise the response ────────────────────────────────────── */
  onProgress('Computing financial insights…');

  const result = await response.json();
  const raw    = (result.content || []).map((b) => b.text || '').join('');

  // Extract the JSON object — handles both clean JSON and markdown-wrapped output
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse AI response. Please try again.');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('AI returned malformed JSON. Please try again.');
  }

  // Compute any missing derived fields
  const s = parsed.summary || {};
  if (!s.savingsRate && s.totalIncome > 0) {
    s.savingsRate = (s.netSavings / s.totalIncome) * 100;
  }
  if (!s.transactionCount && parsed.transactions) {
    s.transactionCount = parsed.transactions.length;
  }

  return parsed;
};