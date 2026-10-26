import { createSlice } from '@reduxjs/toolkit';
import { leadsApi, visitsApi, registrationApi } from '../../api';
import { apiThunk, resetApp, toPage, listInitial, addListCases } from '../helpers';

/**
 * Admin-managed master lists: unit categories, lead sources, visit time
 * slots and the CP registration documents. Each is fetched once per session.
 */
const LOADERS = {
  categories: () => leadsApi.categories(), // [{ id, name }]
  sources: () => leadsApi.sources(), // [{ id, name }]
  timeSlots: () => visitsApi.timeSlots(), // [{ id, formatted_slot, start_time, end_time }]
  cpDocuments: () => registrationApi.cpDocuments(), // [{ id, name, field_key, is_mandatory }]
};

export const fetchLookup = apiThunk(
  'lookups/fetch',
  async (name) => {
    const res = await LOADERS[name]();
    return Array.isArray(res.data) ? res.data : [];
  },
  {
    condition: (name, { getState }) => {
      const status = getState().lookups[name]?.status;
      return status !== 'loading' && status !== 'succeeded';
    },
  }
);

/**
 * People picker (GET /leads/references): referrers for a lead, the employee a
 * partner knows, WhatsApp recipients. `key` names the picker so each keeps
 * its own results. `{ key, search, userType, page }`
 */
export const searchReferences = apiThunk('lookups/references', async ({ search, userType, page = 1 }) => {
  const res = await leadsApi.references({ search, user_type: userType, page });
  return toPage(res.data);
});

const entry = () => ({ items: [], status: 'idle', error: null });

const initialState = {
  categories: entry(),
  sources: entry(),
  timeSlots: entry(),
  cpDocuments: entry(),
  references: {},
};

const lookupsSlice = createSlice({
  name: 'lookups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(resetApp, () => initialState)
      .addCase(fetchLookup.pending, (state, action) => {
        state[action.meta.arg].status = 'loading';
        state[action.meta.arg].error = null;
      })
      .addCase(fetchLookup.fulfilled, (state, action) => {
        state[action.meta.arg].status = 'succeeded';
        state[action.meta.arg].items = action.payload;
      })
      .addCase(fetchLookup.rejected, (state, action) => {
        if (action.meta.condition) return;
        state[action.meta.arg].status = 'failed';
        state[action.meta.arg].error = action.payload || action.error.message;
      });
    addListCases(builder, searchReferences, (state, action) => {
      const { key } = action.meta.arg;
      if (!state.references[key]) state.references[key] = listInitial();
      return state.references[key];
    });
  },
});

export default lookupsSlice.reducer;
