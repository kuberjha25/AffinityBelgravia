import { createSlice } from '@reduxjs/toolkit';
import { leadsApi, visitsApi, masterApi, requestsApi } from '../../api';
import { apiThunk, resetApp, toPage, listInitial, addListCases } from '../helpers';

/**
 * Admin-managed master lists, each fetched once per session:
 * unit categories, lead sources, lead statuses, visit time slots, business
 * types and states. Cities (per state) and CP documents (per business type)
 * are cached per key.
 */
const LOADERS = {
  categories: () => leadsApi.categories(), // [{ id, name }]
  sources: () => leadsApi.sources(), // [{ id, name }]
  leadStatuses: () => leadsApi.statuses(), // [{ id, name }] — user-settable statuses only
  timeSlots: () => visitsApi.timeSlots(), // [{ id, formatted_slot, start_time, end_time }]
  businessTypes: () => masterApi.businessTypes(), // [{ id, name, slug }]
  states: () => masterApi.states(), // [{ id, name, slug }]
  requestTypes: () => requestsApi.types(), // [{ id, name, tat_hours }]
};

const KEYED_LOADERS = {
  cities: (stateId) => masterApi.cities(stateId), // [{ id, name, slug, state_id }]
  cpDocuments: (businessType) => masterApi.cpDocuments(businessType), // [{ id, name, field_key, is_mandatory }]
};

const loaded = (entry) => entry?.status === 'loading' || entry?.status === 'succeeded';

export const fetchLookup = apiThunk(
  'lookups/fetch',
  async (name) => {
    const res = await LOADERS[name]();
    return Array.isArray(res.data) ? res.data : [];
  },
  { condition: (name, { getState }) => !loaded(getState().lookups[name]) }
);

/** `{ name: 'cities' | 'cpDocuments', key }` — `key` is the state id / business type slug. */
export const fetchKeyedLookup = apiThunk(
  'lookups/fetchKeyed',
  async ({ name, key }) => {
    const res = await KEYED_LOADERS[name](key);
    return Array.isArray(res.data) ? res.data : [];
  },
  { condition: ({ name, key }, { getState }) => !loaded(getState().lookups[name][key]) }
);

/**
 * People picker (GET /leads/references): "Lead For" on leads and visits, the
 * employee a partner knows, WhatsApp recipients. `key` names the picker so
 * each keeps its own results. `{ key, search, userType, page, auth }` —
 * `auth: false` during self-registration.
 */
export const searchReferences = apiThunk('lookups/references', async ({ search, userType, page = 1, auth = true }) => {
  const res = await leadsApi.references({ search, user_type: userType, page }, { auth });
  return toPage(res.data);
});

/**
 * The reference row for a known id. The API has no lookup by id, so this
 * walks the pages (up to `maxPages`). → the row, or null.
 */
export const findReference = apiThunk('lookups/findReference', async ({ id, userType, maxPages = 10 }) => {
  for (let page = 1; page <= maxPages; page += 1) {
    const { data, lastPage } = toPage((await leadsApi.references({ user_type: userType, page })).data);
    const hit = data.find((r) => String(r.id) === String(id));
    if (hit) return hit;
    if (page >= lastPage) break;
  }
  return null;
});

const entry = () => ({ items: [], status: 'idle', error: null });

const initialState = {
  ...Object.fromEntries(Object.keys(LOADERS).map((name) => [name, entry()])),
  cities: {},
  cpDocuments: {},
  references: {},
};

const lookupsSlice = createSlice({
  name: 'lookups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const keyed = (state, arg) => {
      if (!state[arg.name][arg.key]) state[arg.name][arg.key] = entry();
      return state[arg.name][arg.key];
    };
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
      })
      .addCase(fetchKeyedLookup.pending, (state, action) => {
        const e = keyed(state, action.meta.arg);
        e.status = 'loading';
        e.error = null;
      })
      .addCase(fetchKeyedLookup.fulfilled, (state, action) => {
        const e = keyed(state, action.meta.arg);
        e.status = 'succeeded';
        e.items = action.payload;
      })
      .addCase(fetchKeyedLookup.rejected, (state, action) => {
        if (action.meta.condition) return;
        const e = keyed(state, action.meta.arg);
        e.status = 'failed';
        e.error = action.payload || action.error.message;
      });
    addListCases(builder, searchReferences, (state, action) => {
      const { key } = action.meta.arg;
      if (!state.references[key]) state.references[key] = listInitial();
      return state.references[key];
    });
  },
});

export default lookupsSlice.reducer;
