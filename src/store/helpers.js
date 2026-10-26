import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

/** Clears every slice (logout / expired session). */
export const resetApp = createAction('app/reset');

/** createAsyncThunk whose rejection payload is the API's human-readable message. */
export const apiThunk = (type, fn, options) =>
  createAsyncThunk(
    type,
    async (arg, api) => {
      try {
        return await fn(arg, api);
      } catch (e) {
        return api.rejectWithValue(e?.message || 'Something went wrong. Please try again.');
      }
    },
    options
  );

/** Normalises a Laravel paginator (or a plain array) to `{ data, page, lastPage, total }`. */
export const toPage = (data) => {
  if (Array.isArray(data)) return { data, page: 1, lastPage: 1, total: data.length };
  return {
    data: data?.data || [],
    page: data?.current_page || 1,
    lastPage: data?.last_page || 1,
    total: data?.total ?? (data?.data || []).length,
  };
};

export const listInitial = () => ({
  items: [],
  page: 0,
  lastPage: 1,
  total: 0,
  args: null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  requestId: null,
  stale: false,
});

/**
 * Reducers for a paginated list thunk whose payload is `toPage(...)`.
 * Page 1 replaces the items, later pages append. Responses that arrive after
 * a newer request (fast typing in search) are ignored.
 */
export function addListCases(builder, thunk, select) {
  builder
    .addCase(thunk.pending, (state, action) => {
      const list = select(state, action);
      list.status = 'loading';
      list.error = null;
      list.requestId = action.meta.requestId;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      const list = select(state, action);
      if (list.requestId !== action.meta.requestId) return;
      const { data, page, lastPage, total } = action.payload;
      list.items = page > 1 ? [...list.items, ...data] : data;
      list.page = page;
      list.lastPage = lastPage;
      list.total = total;
      const { page: _page, ...args } = action.meta.arg || {};
      list.args = args;
      list.status = 'succeeded';
      list.stale = false;
    })
    .addCase(thunk.rejected, (state, action) => {
      const list = select(state, action);
      if (list.requestId !== action.meta.requestId) return;
      list.status = 'failed';
      list.error = action.payload || action.error.message;
    });
}

/** Reducers for a detail thunk called with an id; results are cached by id. */
export function addDetailCases(builder, thunk, key = 'details') {
  const statusKey = `${key}Status`;
  const errorKey = `${key}Error`;
  builder
    .addCase(thunk.pending, (state, action) => {
      state[statusKey][action.meta.arg] = 'loading';
      state[errorKey][action.meta.arg] = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state[key][action.meta.arg] = action.payload;
      state[statusKey][action.meta.arg] = 'succeeded';
    })
    .addCase(thunk.rejected, (state, action) => {
      state[statusKey][action.meta.arg] = 'failed';
      state[errorKey][action.meta.arg] = action.payload || action.error.message;
    });
}

export const detailInitial = (key = 'details') => ({
  [key]: {},
  [`${key}Status`]: {},
  [`${key}Error`]: {},
});

export const hasMore = (list) => list.page > 0 && list.page < list.lastPage;
