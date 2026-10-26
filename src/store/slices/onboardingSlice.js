import { createSlice } from '@reduxjs/toolkit';
import { resetApp } from '../helpers';

/**
 * Registration wizard (Complete Profile steps 1–3). Used for a new partner's
 * self-registration after OTP (`mode: 'self'`) and for staff registering a
 * partner from the Registrations screen (`mode: 'admin'`).
 */
const blank = (mode = 'self', mobile = '') => ({
  mode,
  mobile,
  partnerType: 'channel_partner',
  basic: {
    firstName: '',
    lastName: '',
    email: '',
    mobile,
    address: '',
    state: '',
    city: '',
    pincode: '',
    dob: '',
    anniversary: '',
  },
  knowsEmployee: 'no',
  employee: null, // { id, name } from /leads/references?user_type=backoffice
  social: { facebook: '', instagram: '', youtube: '' },
  business: {
    companyName: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    reraNumber: '',
    msmeNumber: '',
  },
  documents: {}, // field_key → picked file
});

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState: blank(),
  reducers: {
    startOnboarding: (_, { payload = {} }) => blank(payload.mode, payload.mobile || ''),
    patchOnboarding: (state, { payload }) => ({ ...state, ...payload }),
    setDocument: (state, { payload: { key, file } }) => {
      if (file) state.documents[key] = file;
      else delete state.documents[key];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetApp, () => blank());
  },
});

export const { startOnboarding, patchOnboarding, setDocument } = onboardingSlice.actions;
export default onboardingSlice.reducer;
