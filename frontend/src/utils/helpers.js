import { CAT_COLORS } from './constants';

/**
 * Format a number as Indian Rupees (₹1,23,456)
 */
export const fmt = (n) => {
  if (n == null || n === '' || isNaN(Number(n))) return '—';
  return '₹' + Math.abs(Number(n)).toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

/**
 * Format a number as a percentage string (e.g. "24.5%")
 */
export const pct = (n) => {
  if (n == null || isNaN(Number(n))) return '—';
  return `${Number(n).toFixed(1)}%`;
};

/**
 * Get the hex color for a transaction category
 */
export const cc = (cat) => CAT_COLORS[cat] || '#64748b';

/**
 * Truncate a string to a max length with ellipsis
 */
export const truncate = (str, max = 40) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
};

/**
 * Read a File object as base64-encoded string (strips data URL prefix)
 */
export const readAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

/**
 * Read a File object as plain text
 */
export const readAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });

/**
 * Download a string as a file
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};