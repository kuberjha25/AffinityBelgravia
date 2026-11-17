import { createSlice } from '@reduxjs/toolkit';
import { registrationApi } from '../../api';
import { apiThunk, resetApp, toPage, listInitial, addListCases, addDetailCases, detailInitial } from '../helpers';
import { signInWithToken } from './authSlice';
import { toApiDate } from '../../format';

/** `{ page, status: 'pending' | 'completed', search, date_filter, start_date, end_date }` */
export const fetchRegistrations = apiThunk('registrations/fetchList', async (params = {}) => {
  const res = await registrationApi.list({ status: 'pending', ...params, page: params.page || 1 });
  return toPage(res.data);
});

export const fetchRegistration = apiThunk('registrations/fetchOne', async (id) => {
  const res = await registrationApi.detail(id);
  return res.data;
});

/** Request fields for POST /registrations and /admin/registrations, from the wizard state. */
function registrationFields(o) {
  const b = o.basic || {};
  const fields = {
    partner_type: o.partnerType,
    first_name: b.firstName?.trim(),
    last_name: b.lastName?.trim(),
    mobile: (b.mobile || o.mobile || '').replace(/\D/g, ''),
    email: b.email?.trim(),
    address: b.address?.trim(),
    city: b.city,
    state: b.state,
    pincode: b.pincode,
    date_of_birth: toApiDate(b.dob),
    anniversary: toApiDate(b.anniversary),
    knows_employee: o.knowsEmployee === 'yes' ? 'yes' : 'no',
    employee_id: o.knowsEmployee === 'yes' ? o.employee?.id : undefined,
  };
  if (o.partnerType === 'influencer') {
    fields.facebook_link = o.social?.facebook?.trim();
    fields.instagram_link = o.social?.instagram?.trim();
    fields.youtube_link = o.social?.youtube?.trim();
  }
  if (o.partnerType === 'channel_partner') {
    const biz = o.business || {};
    fields.company_name = biz.companyName?.trim();
    fields.business_type = biz.businessType;
    fields.gst_number = biz.gstNumber?.trim();
    fields.pan_number = biz.panNumber?.trim();
    fields.rera_number = biz.reraNumber?.trim();
    fields.msme_number = biz.msmeNumber?.trim();
  }
  Object.keys(fields).forEach((k) => {
    if (fields[k] === undefined || fields[k] === null || fields[k] === '') delete fields[k];
  });
  return fields;
}

/**
 * Only the files for documents the chosen business type asks for — a file
 * picked under another type would otherwise be uploaded too.
 */
function documentsFor(o, lookups) {
  if (o.partnerType !== 'channel_partner') return {};
  const list = lookups.cpDocuments[o.business?.businessType];
  if (list?.status !== 'succeeded') return o.documents;
  const keys = new Set(list.items.map((d) => d.field_key));
  return Object.fromEntries(Object.entries(o.documents).filter(([key]) => keys.has(key)));
}

/**
 * Submits the registration wizard.
 * Self-registration → `{ mode: 'self', signedIn, message }`. The backend
 * returns `token: null` until Admin approves; then the partner is NOT signed in.
 * Staff registration → `{ requiresOtp, mobile }` so the partner's mobile can be
 * verified next. Nothing from that response is used to sign in.
 */
export const submitRegistration = apiThunk('registrations/submit', async (_, { getState, dispatch }) => {
  const { onboarding: o, lookups } = getState();
  const fields = registrationFields(o);
  const documents = documentsFor(o, lookups);

  if (o.mode === 'admin') {
    const res = await registrationApi.adminRegister(fields, documents);
    return { mode: 'admin', requiresOtp: Boolean(res.requires_otp), mobile: res.mobile || fields.mobile };
  }

  const res = await registrationApi.register(fields, documents);
  if (res.token) await dispatch(signInWithToken({ token: res.token, user: res.data || null }));
  return { mode: 'self', signedIn: Boolean(res.token), message: res.message };
});

export const verifyRegistrantOtp = apiThunk('registrations/verifyOtp', async ({ mobile, otp }) => {
  const res = await registrationApi.adminVerifyOtp(mobile, otp);
  return res.message || 'Mobile verified successfully.';
});

export const resendRegistrantOtp = apiThunk('registrations/resendOtp', async (mobile) => {
  const res = await registrationApi.adminResendOtp(mobile);
  return res.message || 'OTP sent.';
});

const initialState = { list: listInitial(), ...detailInitial() };

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetApp, () => initialState);
    addListCases(builder, fetchRegistrations, (state) => state.list);
    addDetailCases(builder, fetchRegistration);
    builder.addCase(submitRegistration.fulfilled, (state) => {
      state.list.stale = true;
    });
  },
});

export default registrationsSlice.reducer;
