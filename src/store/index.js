/**
 * Redux store (Redux Toolkit; API calls are redux-thunk async thunks via
 * createAsyncThunk). One slice per area of the app.
 */
import { Alert } from 'react-native';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { setUnauthorizedHandler } from '../api';
import { resetTo } from '../navigation/navigationRef';

import auth, { logout, selectRole } from './slices/authSlice';
import onboarding from './slices/onboardingSlice';
import leads from './slices/leadsSlice';
import visits from './slices/visitsSlice';
import registrations from './slices/registrationsSlice';
import projects from './slices/projectsSlice';
import content from './slices/contentSlice';
import notifications from './slices/notificationsSlice';
import lookups from './slices/lookupsSlice';
import dashboard from './slices/dashboardSlice';
import { hasPermission } from '../permissions';

export const store = configureStore({
  reducer: {
    auth,
    onboarding,
    leads,
    visits,
    registrations,
    projects,
    content,
    notifications,
    lookups,
    dashboard,
  },
  // Picked upload files live in the onboarding state and thunk args.
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

/* A 401 on a signed-in request means the token expired or was revoked. */
let expiring = false;
setUnauthorizedHandler(async () => {
  if (expiring || !store.getState().auth.token) return;
  expiring = true;
  await store.dispatch(logout());
  resetTo('Login');
  Alert.alert('Session expired', 'Please log in again.');
  expiring = false;
});

export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;

/** `{ isStaff, can }` for the signed-in user. */
export function usePermissions() {
  const role = useSelector(selectRole);
  return { role, isStaff: role === 'staff', can: (permission) => hasPermission(role, permission) };
}
