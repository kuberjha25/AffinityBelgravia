import { createSlice } from '@reduxjs/toolkit';
import { projectsApi } from '../../api';
import { apiThunk, resetApp, toPage, listInitial, addListCases, addDetailCases, detailInitial } from '../helpers';

/** `{ page, search }` */
export const fetchProjects = apiThunk('projects/fetchList', async (params = {}) => {
  const res = await projectsApi.list({ ...params, page: params.page || 1 });
  return toPage(res.data);
});

export const fetchProject = apiThunk('projects/fetchOne', async (id) => {
  const res = await projectsApi.detail(id);
  return res.data;
});

/* Inventory: project → towers → categories in a tower → units. Cached per key. */

export const towersKey = (projectId) => String(projectId);
export const categoriesKey = (projectId, towerId) => `${projectId}:${towerId}`;
export const unitsKey = (projectId, towerId, categoryId) => `${projectId}:${towerId}:${categoryId}`;

export const fetchTowers = apiThunk('inventory/towers', async (projectId) => {
  const res = await projectsApi.towers(projectId);
  return res.data || [];
});

export const fetchInventoryCategories = apiThunk('inventory/categories', async ({ projectId, towerId }) => {
  const res = await projectsApi.categories(projectId, towerId);
  return res.data || [];
});

export const fetchUnits = apiThunk('inventory/units', async ({ projectId, towerId, categoryId }) => {
  const res = await projectsApi.units(projectId, towerId, categoryId);
  return res.data || [];
});

const keyed = () => ({ data: {}, status: {}, error: {} });

const initialState = {
  list: listInitial(),
  ...detailInitial(),
  towers: keyed(),
  categories: keyed(),
  units: keyed(),
};

function addKeyedCases(builder, thunk, bucket, keyOf) {
  builder
    .addCase(thunk.pending, (state, action) => {
      const k = keyOf(action.meta.arg);
      state[bucket].status[k] = 'loading';
      state[bucket].error[k] = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      const k = keyOf(action.meta.arg);
      state[bucket].data[k] = action.payload;
      state[bucket].status[k] = 'succeeded';
    })
    .addCase(thunk.rejected, (state, action) => {
      const k = keyOf(action.meta.arg);
      state[bucket].status[k] = 'failed';
      state[bucket].error[k] = action.payload || action.error.message;
    });
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetApp, () => initialState);
    addListCases(builder, fetchProjects, (state) => state.list);
    addDetailCases(builder, fetchProject);
    addKeyedCases(builder, fetchTowers, 'towers', towersKey);
    addKeyedCases(builder, fetchInventoryCategories, 'categories', (a) => categoriesKey(a.projectId, a.towerId));
    addKeyedCases(builder, fetchUnits, 'units', (a) => unitsKey(a.projectId, a.towerId, a.categoryId));
  },
});

export default projectsSlice.reducer;
