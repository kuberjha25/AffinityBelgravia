/**
 * One function per backend endpoint (same API as Meraqui, different base URL).
 * Each returns the parsed response body; thunks in src/store pick what they need.
 */
import { request, toFormData } from './client';

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

export const registrationApi = {
  cpDocuments: () => request('/cp-documents', { auth: false }),
  /** Self-registration of a new partner; returns their first token. */
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
  references: (params) => request('/leads/references', { params }),
  categories: () => request('/leads/categories'),
  sources: () => request('/leads/sources'),
};

/* -------------------------------------------------------------- visits */

export const visitsApi = {
  list: (params) => request('/visits', { params }),
  create: (body) => request('/visits', { method: 'POST', body }),
  detail: (id) => request(`/visits/${id}`),
  attend: (id, remarks) => request(`/visits/${id}/attend`, { method: 'POST', body: { remarks } }),
  timeSlots: () => request('/visits/time-slots'),
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
};

/* ------------------------------------------------------------- content */

export const contentApi = {
  promotions: (params) => request('/promotions', { params }),
  promotion: (id) => request(`/promotions/${id}`),
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
