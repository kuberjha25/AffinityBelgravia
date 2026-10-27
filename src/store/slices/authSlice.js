import { createSlice } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import { authApi, setAuthToken } from '../../api';
import { loadToken, saveToken, clearToken } from '../../api/storage';
import { apiThunk, resetApp } from '../helpers';
import { hasPermission, roleForUser } from '../../permissions';
import { getPushToken } from '../../push';

const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';

/**
 * Best-effort FCM token refresh for an already-signed-in session. Tokens
 * rotate, so we re-send on each launch. Never throws — push is optional.
 */
async function syncPushToken() {
  try {
    const fcmToken = await getPushToken();
    if (fcmToken) await authApi.saveFcmToken(fcmToken, deviceType);
  } catch {
    // ignore — a missing push token must not disrupt the session
  }
}

/** Reads the saved token on launch and loads the profile with it. */
export const bootstrapSession = apiThunk('auth/bootstrap', async () => {
  const token = await loadToken();
  if (!token) return { token: null };
  setAuthToken(token);
  try {
    const res = await authApi.profile();
    syncPushToken(); // fire-and-forget: refresh the FCM token for this session
    return { token, user: res.data?.user || null, stats: res.data?.stats || null };
  } catch (e) {
    if (e.status === 401) {
      await clearToken();
      setAuthToken(null);
      return { token: null };
    }
    // Offline or server error: keep the session, screens retry their own requests.
    return { token, user: null, stats: null };
  }
});

/**
 * While SMS delivery is disabled, the backend returns the OTP in the
 * `send-otp` response so it can be shown on screen for testing. Reads it from
 * whichever field the API uses, falling back to a 4–8 digit run in the
 * message. Returns null once the backend stops including it (SMS working).
 */
function extractOtp(res) {
  const direct = res?.otp ?? res?.data?.otp ?? res?.data?.code ?? res?.data?.otp_code;
  if (direct != null && /^\d{3,8}$/.test(String(direct).trim())) return String(direct).trim();
  const match = String(res?.message || '').match(/\b(\d{4,8})\b/);
  return match ? match[1] : null;
}

export const sendOtp = apiThunk('auth/sendOtp', async (mobile) => {
  const res = await authApi.sendOtp(mobile);
  return { message: res.message || 'OTP sent successfully.', otp: extractOtp(res) };
});

/** → `{ isNewUser }`. An existing active user is signed in; a new one continues to registration. */
export const verifyOtp = apiThunk('auth/verifyOtp', async ({ mobile, otp }) => {
  const fcmToken = await getPushToken();
  const res = await authApi.verifyOtp({ mobile, otp, fcmToken, deviceType });
  if (res.is_new_user || !res.token) return { isNewUser: true, mobile };
  await saveToken(res.token);
  setAuthToken(res.token);
  return { isNewUser: false, token: res.token, user: res.user || null };
});

export const fetchProfile = apiThunk('auth/fetchProfile', async () => {
  const res = await authApi.profile();
  return { user: res.data?.user || null, stats: res.data?.stats || null };
});

/** `fields` as in PUT /auth/profile; `photo` (optional) is a picked image file. */
export const updateProfile = apiThunk('auth/updateProfile', async ({ fields, photo }, { dispatch }) => {
  if (photo) await authApi.updateProfileWithPhoto(fields, photo);
  else await authApi.updateProfile(fields);
  await dispatch(fetchProfile());
  return true;
});

/** Stores a token handed out by self-registration. */
export const signInWithToken = apiThunk('auth/signInWithToken', async ({ token, user }, { dispatch }) => {
  await saveToken(token);
  setAuthToken(token);
  dispatch(fetchProfile());
  syncPushToken(); // register this device for push after self-registration
  return { token, user };
});

export const logout = apiThunk('auth/logout', async (_, { dispatch }) => {
  await clearToken();
  setAuthToken(null);
  dispatch(resetApp());
  return true;
});

const initialState = {
  token: null,
  user: null,
  stats: null,
  bootstrapped: false,
  profileStatus: 'idle',
  profileError: null,
  devOtp: null, // OTP echoed back by the backend while SMS is down (testing only)
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(resetApp, () => ({ ...initialState, bootstrapped: true }))
      .addCase(sendOtp.fulfilled, (state, { payload }) => {
        state.devOtp = payload?.otp || null;
      })
      .addCase(bootstrapSession.fulfilled, (state, { payload }) => {
        state.bootstrapped = true;
        state.token = payload.token;
        state.user = payload.user || null;
        state.stats = payload.stats || null;
      })
      .addCase(bootstrapSession.rejected, (state) => {
        state.bootstrapped = true;
      })
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        if (payload.isNewUser) return;
        state.token = payload.token;
        state.user = payload.user;
      })
      .addCase(signInWithToken.fulfilled, (state, { payload }) => {
        state.token = payload.token;
        state.user = state.user || payload.user;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.profileStatus = 'loading';
        state.profileError = null;
      })
      .addCase(fetchProfile.fulfilled, (state, { payload }) => {
        state.profileStatus = 'succeeded';
        if (payload.user) state.user = payload.user;
        state.stats = payload.stats;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.profileError = action.payload;
      });
  },
});

export default authSlice.reducer;

export const selectDevOtp = (state) => state.auth.devOtp;
export const selectUser = (state) => state.auth.user;
export const selectStats = (state) => state.auth.stats;
export const selectRole = (state) => roleForUser(state.auth.user);
export const selectIsStaff = (state) => selectRole(state) === 'staff';
export const selectCan = (permission) => (state) => hasPermission(selectRole(state), permission);
