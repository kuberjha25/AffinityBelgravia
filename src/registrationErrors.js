import { humanize } from './format';

/* Reading a failed POST /registrations (or /admin/registrations) 422. */

/** Registration fields by the wizard screen that collects them (for "Edit details"). */
const FIELD_SCREENS = {
  CompleteProfile: [
    'partner_type', 'first_name', 'last_name', 'mobile', 'email', 'address', 'city', 'state', 'pincode',
    'date_of_birth', 'anniversary', 'knows_employee', 'employee_id',
  ],
  ChannelPartnerDetails: ['company_name', 'business_type', 'gst_number', 'pan_number', 'rera_number', 'msme_number'],
};
export const screenForField = (key) =>
  Object.keys(FIELD_SCREENS).find((screen) => FIELD_SCREENS[screen].includes(String(key).split('.')[0])) || null;

const firstMessage = (value) => String((Array.isArray(value) ? value[0] : value) || '');
const lower = (v) => String(v || '').toLowerCase();

/**
 * Splits a failed registration's Laravel errors into documents the API wants
 * (`documents.<field_key>`, `documents[<field_key>]`, a bare field_key, or a
 * `documents` message naming a document) and every other field error.
 */
export function readRegistrationErrors(message, fieldErrors, knownDocs) {
  const docs = {};
  const others = [];
  const byKey = Object.fromEntries(knownDocs.map((d) => [d.field_key, d]));
  const byName = (text) => knownDocs.find((d) => d.name && lower(text).includes(lower(d.name)));
  const addDoc = (key, msg) => {
    docs[key] = { name: byKey[key]?.name || humanize(key), message: msg };
  };

  Object.entries(fieldErrors || {}).forEach(([key, value]) => {
    const msg = firstMessage(value);
    const nested = key.match(/^documents?(?:\.|\[)([^.\]]+)/);
    if (nested) return addDoc(nested[1], msg);
    if (byKey[key]) return addDoc(key, msg);
    if (/^documents?$/.test(key)) {
      const named = byName(msg);
      if (named) return addDoc(named.field_key, msg);
    }
    others.push({ key, message: msg });
  });

  // No field errors at all, but the message names a document.
  if (!fieldErrors && message) {
    const named = byName(message);
    if (named) addDoc(named.field_key, message);
  }
  return { docs, others };
}
