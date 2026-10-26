import { createSlice } from '@reduxjs/toolkit';
import { leadsApi, visitsApi, registrationApi } from '../../api';
import { apiThunk, resetApp, toPage } from '../helpers';

/** Total rows of a filtered list — page 1 of any list carries `total`. */
const countOf = async (call, params) => {
  const res = await call({ ...params, page: 1 });
  return toPage(res.data).total;
};

const settle = async (entries) => {
  const keys = Object.keys(entries);
  const results = await Promise.allSettled(keys.map((k) => entries[k]()));
  const out = {};
  keys.forEach((k, i) => {
    out[k] = results[i].status === 'fulfilled' ? results[i].value : null;
  });
  if (keys.length && keys.every((k) => out[k] === null)) {
    throw results.find((r) => r.status === 'rejected').reason;
  }
  return out;
};

/** "At a Glance" counts on Home. */
export const fetchDashboard = apiThunk('dashboard/fetch', async ({ isStaff }) =>
  settle({
    leads: () => countOf(leadsApi.list),
    visitsScheduled: () => countOf(visitsApi.list, { status: 'scheduled' }),
    ...(isStaff ? { registrationsPending: () => countOf(registrationApi.list, { status: 'pending' }) } : null),
  })
);

/**
 * MIS report for a period, built from the list endpoints' totals (the backend
 * has no report endpoint yet). `dateParams` = `{ date_filter, start_date, end_date }`.
 */
export const fetchMis = apiThunk('dashboard/mis', async (dateParams) =>
  settle({
    visits: () => countOf(visitsApi.list, dateParams),
    visitsScheduled: () => countOf(visitsApi.list, { ...dateParams, status: 'scheduled' }),
    visitsInProgress: () => countOf(visitsApi.list, { ...dateParams, status: 'in_progress' }),
    visitsCompleted: () => countOf(visitsApi.list, { ...dateParams, status: 'completed' }),
    visitsCancelled: () => countOf(visitsApi.list, { ...dateParams, status: 'cancelled' }),
    leads: () => countOf(leadsApi.list, dateParams),
    leadsBooked: () => countOf(leadsApi.list, { ...dateParams, status: 'booked' }),
    registrationsPending: () => countOf(registrationApi.list, { ...dateParams, status: 'pending' }),
    registrationsCompleted: () => countOf(registrationApi.list, { ...dateParams, status: 'completed' }),
  })
);

const initialState = {
  glance: {},
  glanceStatus: 'idle',
  glanceError: null,
  mis: null,
  misStatus: 'idle',
  misError: null,
  misRequestId: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(resetApp, () => initialState)
      .addCase(fetchDashboard.pending, (state) => {
        state.glanceStatus = 'loading';
        state.glanceError = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, { payload }) => {
        state.glanceStatus = 'succeeded';
        state.glance = payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.glanceStatus = 'failed';
        state.glanceError = action.payload;
      })
      .addCase(fetchMis.pending, (state, action) => {
        state.misStatus = 'loading';
        state.misError = null;
        state.misRequestId = action.meta.requestId;
      })
      .addCase(fetchMis.fulfilled, (state, action) => {
        if (state.misRequestId !== action.meta.requestId) return;
        state.misStatus = 'succeeded';
        state.mis = action.payload;
      })
      .addCase(fetchMis.rejected, (state, action) => {
        if (state.misRequestId !== action.meta.requestId) return;
        state.misStatus = 'failed';
        state.misError = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
