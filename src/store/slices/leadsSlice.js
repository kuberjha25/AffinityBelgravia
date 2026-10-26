import { createSlice } from '@reduxjs/toolkit';
import { leadsApi } from '../../api';
import { apiThunk, resetApp, toPage, listInitial, addListCases, addDetailCases, detailInitial } from '../helpers';

/** `{ page, search, status, lead_type, date_filter, start_date, end_date }` */
export const fetchLeads = apiThunk('leads/fetchList', async (params = {}) => {
  const res = await leadsApi.list({ ...params, page: params.page || 1 });
  return toPage(res.data);
});

export const fetchLead = apiThunk('leads/fetchOne', async (id) => {
  const res = await leadsApi.detail(id);
  const d = res.data || {};
  // Older servers used first_name/last_name, next_followup_date and assigned_user.
  return {
    ...d,
    full_name: d.full_name || [d.first_name, d.last_name].filter(Boolean).join(' '),
    next_follow_up: d.next_follow_up ?? d.next_followup_date ?? null,
    assigned_to: typeof d.assigned_to === 'string' ? d.assigned_to : d.assigned_user?.name || null,
    history: Array.isArray(d.history) ? d.history : [],
  };
});

export const createLead = apiThunk('leads/create', async (body) => {
  const res = await leadsApi.create(body);
  return res.data;
});

export const updateLead = apiThunk('leads/update', async ({ id, body }, { dispatch }) => {
  const res = await leadsApi.update(id, body);
  dispatch(fetchLead(id));
  return res.data;
});

/** Adds a follow-up / note; `status` and `lead_type` (optional) also update the lead. */
export const addFollowup = apiThunk('leads/addFollowup', async ({ id, body }, { dispatch }) => {
  const res = await leadsApi.addFollowup(id, body);
  dispatch(fetchLead(id));
  return res.data;
});

const initialState = { list: listInitial(), ...detailInitial() };

const markStale = (state) => {
  state.list.stale = true;
};

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetApp, () => initialState);
    addListCases(builder, fetchLeads, (state) => state.list);
    addDetailCases(builder, fetchLead);
    builder
      .addCase(createLead.fulfilled, markStale)
      .addCase(updateLead.fulfilled, markStale)
      .addCase(addFollowup.fulfilled, markStale);
  },
});

export default leadsSlice.reducer;
