import { createSlice } from '@reduxjs/toolkit';
import { requestsApi } from '../../api';
import { apiThunk, resetApp, toPage, listInitial, addListCases, addDetailCases, detailInitial } from '../helpers';

/**
 * Partner requests ("Raise Request"): the signed-in partner's own requests,
 * each with a turnaround deadline and a timeline of Admin replies.
 * Dates from this API are "YYYY-MM-DD HH:mm:ss" in UTC (see fromUtcDateTime).
 */

/** `{ page, status, priority }` */
export const fetchRequests = apiThunk('requests/fetchList', async (params = {}) => {
  const res = await requestsApi.list({ ...params, page: params.page || 1 });
  return toPage(res.data);
});

export const fetchRequest = apiThunk('requests/fetchOne', async (id) => {
  const res = await requestsApi.detail(id);
  const d = res.data || {};
  return { ...d, history: Array.isArray(d.history) ? d.history : [] };
});

/** `{ request_type_id, remarks, inventory_id?, priority? }` → the created row (`id` opens its detail). */
export const createRequest = apiThunk('requests/create', async (body) => {
  const res = await requestsApi.create(body);
  return res.data || {};
});

const initialState = { list: listInitial(), ...detailInitial() };

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetApp, () => initialState);
    addListCases(builder, fetchRequests, (state) => state.list);
    addDetailCases(builder, fetchRequest);
    builder.addCase(createRequest.fulfilled, (state) => {
      state.list.stale = true;
    });
  },
});

export default requestsSlice.reducer;

/** TAT for display: 48 → "2 days", 24 → "1 day", 36 → "36 hrs". */
export const formatTat = (hours) => {
  const h = Number(hours);
  if (!h) return '';
  if (h % 24 === 0) return `${h / 24} ${h === 24 ? 'day' : 'days'}`;
  return `${h} hrs`;
};
