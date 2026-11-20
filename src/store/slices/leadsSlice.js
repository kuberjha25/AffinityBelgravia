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

/** PUT /leads/{id} — lead details only. `status` is never sent here (see `updateLeadStatus`). */
export const updateLead = apiThunk('leads/update', async ({ id, body }, { dispatch }) => {
  const { status: _status, ...details } = body || {};
  const res = await leadsApi.update(id, details);
  dispatch(fetchLead(id));
  return res.data;
});

/**
 * PATCH /leads/{id}/status `{ status, remarks }`. The response carries only
 * `{ id, status, remarks }`, which the reducer merges into the cached detail
 * and list rows; the detail is then refetched quietly so History shows the change.
 */
export const updateLeadStatus = apiThunk('leads/updateStatus', async ({ id, status, remarks }, { dispatch }) => {
  const res = await leadsApi.updateStatus(id, { status, remarks });
  const d = res.data || {};
  dispatch(fetchLead(id));
  return { id: d.id ?? id, status: d.status ?? status, remarks: d.remarks ?? remarks };
});

/**
 * Adds a follow-up: `{ followup_date, followup_time?, activity?, remarks, lead_type? }`.
 * Send `lead_type` only when it changed; never `status` — the backend moves a
 * `new` lead to `follow_up` itself.
 */
export const addFollowup = apiThunk('leads/addFollowup', async ({ id, body }, { dispatch }) => {
  const res = await leadsApi.addFollowup(id, body);
  dispatch(fetchLead(id));
  return res.data;
});

/** Marks a follow-up task (`history[]` entry with `type: "task"`) done, then reloads the lead. */
export const completeFollowup = apiThunk(
  'leads/completeFollowup',
  async ({ id, followupId, remarks }, { dispatch }) => {
    const res = await leadsApi.completeFollowup(id, followupId, remarks);
    await dispatch(fetchLead(id));
    return res.message;
  }
);

const initialState = { list: listInitial(), ...detailInitial() };

const markStale = (state) => {
  state.list.stale = true;
};

/** Merges `{ id, status, remarks }` into every cached copy of that lead. */
const mergeStatus = (state, { payload, meta }) => {
  const changes = { status: payload.status, remarks: payload.remarks };
  // Details are cached under the id the screen used (route param), which may be a string.
  [meta.arg.id, payload.id].forEach((key) => {
    if (state.details[key]) Object.assign(state.details[key], changes);
  });
  state.list.items.forEach((item) => {
    if (String(item.id) === String(payload.id)) Object.assign(item, changes);
  });
  state.list.stale = true; // status filters and counts may have changed
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
      .addCase(updateLeadStatus.fulfilled, mergeStatus)
      .addCase(addFollowup.fulfilled, markStale)
      .addCase(completeFollowup.fulfilled, markStale);
  },
});

export default leadsSlice.reducer;
