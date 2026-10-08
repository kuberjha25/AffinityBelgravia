/** Display helpers for the partial identifiers kept on CP-sourced leads and visits (#4). */

/** "+91 98765 43210" for direct leads, "XXXXXX 3210" when only the last 4 digits were captured. */
export const displayMobile = (rec = {}) => {
  if (rec.phone) return rec.phone;
  if (rec.mobileLast4) return `XXXXXX ${rec.mobileLast4}`;
  return '—';
};

export const displayAadhaar = (last4) => (last4 ? `XXXX XXXX ${last4}` : '—');

/** Phone search that also matches the last-4 digits of CP-sourced records. */
export const matchesPhone = (rec, query) => {
  const q = query.replace(/\D/g, '');
  if (!q) return false;
  return (rec.phone || '').replace(/\D/g, '').includes(q) || (rec.mobileLast4 || '').includes(q);
};

/** Digits only, at most `n` long — used by the "last 4 digits" inputs. */
export const digits = (value, n) => value.replace(/\D/g, '').slice(0, n);
