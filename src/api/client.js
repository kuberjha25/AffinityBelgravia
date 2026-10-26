/**
 * HTTP client for the Affinity Belgravia backend (Laravel + Sanctum).
 *
 * Every response uses the envelope `{ status, message, data }`; a request
 * fails when the HTTP status is not 2xx or `status === false`
 * (`/notifications` uses `success` instead of `status`).
 */
export const BASE_URL = 'https://affinitybelgravia.in';
export const API_URL = `${BASE_URL}/api`;

let authToken = null;
let unauthorizedHandler = null;

export const setAuthToken = (token) => {
  authToken = token || null;
};

export const getAuthToken = () => authToken;

/** Called once when a signed-in request comes back 401 (token expired or revoked). */
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

export class ApiError extends Error {
  constructor(message, { status = 0, errors = null, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.data = data;
  }
}

/** First message of the first field in a Laravel 422 `errors` object. */
const firstValidationError = (errors) => {
  if (!errors || typeof errors !== 'object') return '';
  const key = Object.keys(errors)[0];
  if (!key) return '';
  const value = errors[key];
  return Array.isArray(value) ? String(value[0] || '') : String(value || '');
};

/**
 * Dev-only request/response logging. Prints to the Metro bundler terminal
 * (where `npx expo start` runs) so backend behaviour can be watched while
 * testing on a device. Silent in production builds (`__DEV__` is false there).
 * The bearer token is never logged in full — only a short fingerprint.
 */
const DEBUG = typeof __DEV__ !== 'undefined' && __DEV__;
let callSeq = 0;

const tokenHint = (token) => (token ? `${String(token).slice(0, 6)}…(${String(token).length} chars)` : 'none');

const preview = (value) => {
  try {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    if (!text) return '';
    return text.length > 1500 ? `${text.slice(0, 1500)}… [${text.length} chars total]` : text;
  } catch {
    return '[unserialisable]';
  }
};

const toQuery = (params) => {
  if (!params) return '';
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

/**
 * `request('/leads', { params: { page: 2 } })` → parsed JSON body.
 * `body` may be a plain object (sent as JSON) or a FormData (multipart).
 * `auth: false` for the public endpoints.
 */
export async function request(path, { method = 'GET', params, body, auth = true } = {}) {
  const url = `${API_URL}${path}${toQuery(params)}`;
  const headers = { Accept: 'application/json' };
  const sentToken = auth ? authToken : null;
  if (sentToken) headers.Authorization = `Bearer ${sentToken}`;

  let payload;
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    payload = body; // the HTTP client sets the multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const tag = `#${(callSeq += 1)}`;
  if (DEBUG) {
    const bodyLog = body instanceof FormData ? '[multipart FormData]' : body !== undefined ? preview(body) : '';
    console.log(
      `\n➡️  API ${tag} ${method} ${url}` +
        `\n    auth: ${auth ? `bearer ${tokenHint(sentToken)}` : 'public (no token)'}` +
        (bodyLog ? `\n    body: ${bodyLog}` : ''),
    );
  }

  let res;
  try {
    res = await fetch(url, { method, headers, body: payload });
  } catch (e) {
    if (DEBUG) console.log(`❌ API ${tag} NETWORK ERROR: ${e?.message || e}`);
    throw new ApiError('Unable to reach the server. Please check your internet connection and try again.');
  }

  let json = null;
  try {
    const text = await res.text();
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (DEBUG) {
    const ok = res.ok && !(json && (json.status === false || json.success === false));
    console.log(`${ok ? '✅' : '⚠️'}  API ${tag} ${res.status} ${method} ${path}\n    response: ${preview(json)}`);
  }

  if (res.status === 401) {
    if (sentToken && unauthorizedHandler) unauthorizedHandler();
    throw new ApiError(json?.message || 'Your session has expired. Please log in again.', { status: 401 });
  }

  const failed = !res.ok || (json && (json.status === false || json.success === false));
  if (failed) {
    const message =
      firstValidationError(json?.errors) || json?.message || `Request failed (${res.status}). Please try again.`;
    throw new ApiError(message, { status: res.status, errors: json?.errors || null, data: json });
  }

  return json || {};
}

/**
 * Builds a multipart body. `files` maps a field name to a picked file
 * (`{ uri, name, type }`, or `{ file }` on web where the picker returns a File).
 */
export function toFormData(fields = {}, files = {}) {
  const fd = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    fd.append(key, String(value));
  });
  Object.entries(files).forEach(([key, file]) => {
    if (!file) return;
    if (file.file) fd.append(key, file.file, file.name);
    else fd.append(key, { uri: file.uri, name: file.name || 'upload', type: file.type || 'application/octet-stream' });
  });
  return fd;
}
