/**
 * One function per backend endpoint (same API as Meraqui, different base URL).
 * Each returns the parsed response body; thunks in src/store pick what they need.
 */
import { ApiError, request, toFormData } from './client';

export { BASE_URL, ApiError, setAuthToken, setUnauthorizedHandler } from './client';

/* ---------------------------------------------------------------- auth */

export const authApi = {
  sendOtp: (mobile) => request('/auth/send-otp', { method: 'POST', body: { mobile }, auth: false }),
  verifyOtp: ({ mobile, otp, fcmToken, deviceType }) =>
    request('/auth/verify-otp', {
      method: 'POST',
      auth: false,
      body: { mobile, otp, fcm_token: fcmToken, device_type: deviceType },
    }),
  profile: () => request('/auth/profile'),
  updateProfile: (fields) => request('/auth/profile', { method: 'PUT', body: fields }),
  /** Laravel can't read a multipart PUT, so this is POST + `_method=PUT`. */
  updateProfileWithPhoto: (fields, photo) =>
    request('/auth/profile', {
      method: 'POST',
      body: toFormData({ ...fields, _method: 'PUT' }, { profile_photo: photo }),
    }),
  saveFcmToken: (fcmToken, deviceType) =>
    request('/device/fcm-token', { method: 'POST', body: { fcm_token: fcmToken, device_type: deviceType } }),
};

/* -------------------------------------------------------- registration */

const registrationBody = (fields, documents) => {
  const files = {};
  Object.entries(documents || {}).forEach(([key, file]) => {
    if (file) files[`documents[${key}]`] = file;
  });
  return Object.keys(files).length ? toFormData(fields, files) : fields;
};

/** Public master data used by the registration, profile, lead and visit forms. */
export const masterApi = {
  /** `[{ id, name, slug }]` — send `slug` as `business_type`. */
  businessTypes: () => request('/business-types', { auth: false }),
  /** Documents Admin requires for a business type. A 404 means none are required. */
  cpDocuments: async (businessType) => {
    try {
      return await request('/cp-documents', { auth: false, params: { business_type: businessType } });
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return { status: true, data: [] };
      throw e;
    }
  },
  /** `[{ id, name, slug }]` */
  states: () => request('/states', { auth: false }),
  /** `[{ id, name, slug, state_id }]` */
  cities: (stateId) => request('/cities', { auth: false, params: { state_id: stateId } }),
};

export const registrationApi = {
  /** Self-registration of a new partner. `token` stays null until Admin approves. */
  register: (fields, documents) =>
    request('/registrations', { method: 'POST', auth: false, body: registrationBody(fields, documents) }),
  list: (params) => request('/registrations', { params }),
  detail: (id) => request(`/registrations/${id}`),
  /** Backoffice registers a partner on their behalf; the partner's mobile is then OTP-verified. */
  adminRegister: (fields, documents) =>
    request('/admin/registrations', { method: 'POST', body: registrationBody(fields, documents) }),
  adminVerifyOtp: (mobile, otp) =>
    request('/admin/registrations/verify-otp', { method: 'POST', body: { mobile, otp } }),
  adminResendOtp: (mobile) => request('/admin/registrations/resend-otp', { method: 'POST', body: { mobile } }),
};

/* --------------------------------------------------------------- leads */

export const leadsApi = {
  list: (params) => request('/leads', { params }),
  create: (body) => request('/leads', { method: 'POST', body }),
  detail: (id) => request(`/leads/${id}`),
  update: (id, body) => request(`/leads/${id}`, { method: 'PUT', body }),
  addFollowup: (id, body) => request(`/leads/${id}/followups`, { method: 'POST', body }),
  completeFollowup: (id, followupId, completionRemarks) =>
    request(`/leads/${id}/followups/${followupId}/complete`, {
      method: 'POST',
      body: { completion_remarks: completionRemarks },
    }),
  /**
   * Public. Self-registration calls it with `auth: false` (a stale token can
   * get the request refused); signed-in pickers send the token.
   */
  references: (params, { auth = true } = {}) => request('/leads/references', { params, auth }),
  categories: () => request('/leads/categories'),
  sources: () => request('/leads/sources'),
  /** Statuses a lead can be set to (`[{ id, name }]`); system statuses are not listed. */
  statuses: () => request('/leads/statuses', { auth: false }),
};

/* -------------------------------------------------------------- visits */

export const visitsApi = {
  list: (params) => request('/visits', { params }),
  create: (body) => request('/visits', { method: 'POST', body }),
  detail: (id) => request(`/visits/${id}`),
  attend: (id, remarks) => request(`/visits/${id}/attend`, { method: 'POST', body: { remarks } }),
  timeSlots: () => request('/visits/time-slots'),
  /** Existing lead for a mobile: `data` is the lead, or null. 403 = registered to another partner. */
  fetchLead: (mobile) => request('/visits/fetch-lead', { method: 'POST', body: { mobile } }),
};

/* ------------------------------------------------- projects & inventory */

export const projectsApi = {
  list: (params) => request('/projects', { params }),
  detail: (id) => request(`/projects/${id}`),
  inventory: (id, params) => request(`/projects/${id}/inventory`, { params }),
  towers: (projectId) => request('/inventory/towers', { params: { project_id: projectId } }),
  categories: (projectId, towerId) =>
    request('/inventory/categories', { params: { project_id: projectId, tower_id: towerId } }),
  units: (projectId, towerId, categoryId) =>
    request('/inventory', { params: { project_id: projectId, tower_id: towerId, category_id: categoryId } }),
  /** "Request for Availability" on a unit; the backend derives project and tower. */
  requestAvailability: (inventoryId) =>
    request('/inventory-request', { method: 'POST', body: { inventory_id: inventoryId } }),
};

/* ------------------------------------------------------------- content */

export const contentApi = {
  promotions: (params) => request('/promotions', { params }),
  promotion: (id) => request(`/promotions/${id}`),
  /** Events only. `status`: attending | not_attending | maybe. */
  rsvp: (id, status) => request(`/promotions/${id}/rsvp`, { method: 'POST', body: { status } }),
  news: (params) => request('/news', { params }),
  newsItem: (id) => request(`/news/${id}`),
  documents: (params) => request('/documents', { params }),
  document: (id) => request(`/documents/${id}`),
  faqs: (params) => request('/faqs', { params }),
};

/* ------------------------------------------------------- notifications */

export const notificationsApi = {
  list: () => request('/notifications'),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
};

/* ---------------------------------------------------- partner requests */

export const requestsApi = {
  /** `[{ id, name, tat_hours }]` */
  types: () => request('/partner-request-types'),
  /** The signed-in partner's own requests. `{ status, priority, page }` */
  list: (params) => request('/partner-requests', { params }),
  detail: (id) => request(`/partner-requests/${id}`),
  /** `{ request_type_id, remarks, inventory_id?, priority? }` */
  create: (body) => request('/partner-requests', { method: 'POST', body }),
};

/* ------------------------------------------------------------ external */

/** India Post PIN code lookup → `{ city, state }` or null. */
export async function lookupPincode(pin) {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { headers: { Accept: 'application/json' } });
    const json = await res.json();
    const entry = Array.isArray(json) ? json[0] : json;
    const office = entry?.Status === 'Success' ? entry.PostOffice?.[0] : null;
    return office ? { city: office.District || '', state: office.State || '' } : null;
  } catch {
    return null;
  }
}
