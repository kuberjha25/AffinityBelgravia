/** Formatting helpers shared by the screens. */
import { BASE_URL } from './api/client';
import { formatDate, parseDisplayDate } from './components/DateField';

const pad = (n) => String(n).padStart(2, '0');

/** "28 May 2024" (the DateField format) → "2024-05-28" for the API; '' when empty. */
export const toApiDate = (display) => {
  const t = parseDisplayDate(display);
  if (!t) return '';
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** "2026-10-25" or "2026-10-25T00:00:00.000000Z" → "25 Oct 2026"; other text is returned as is. */
export const fromApiDate = (value) => {
  if (!value) return '';
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(value);
  return formatDate(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
};

/** Today as "YYYY-MM-DD". */
export const todayApiDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** "follow_up" → "Follow Up", "channel_partner" → "Channel Partner". */
export const humanize = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Backend placeholders ("N/A", "-", null) → "—". */
export const orDash = (value) => {
  if (value === null || value === undefined) return '—';
  const v = String(value).trim();
  return !v || v === 'N/A' || v === '-' ? '—' : v;
};

/** The backend masks mobile/email for some roles ("98******17"); never dial or mail those. */
export const isMasked = (value) => String(value || '').includes('*');

/** Absolute URL for a file path relative to /storage (absolute URLs pass through). */
export const storageUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_URL}/storage/${String(path).replace(/^\/?(storage\/)?/, '')}`;
};

/** Image source for a remote URL, or the bundled fallback. */
export const imageSource = (url, fallback) => (url ? { uri: storageUrl(url) } : fallback);

/** Digits only, at most `n` long. */
export const digits = (value, n) => String(value || '').replace(/\D/g, '').slice(0, n);

/** "₹35,00,000" from a number or numeric string; '' when not a number. */
export const rupees = (value) => {
  const n = Number(value);
  if (!value || Number.isNaN(n)) return '';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

/** Strips HTML tags from rich-text fields (news content, descriptions) into paragraphs. */
export const plainParagraphs = (html) =>
  String(html || '')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
