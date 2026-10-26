import { createSlice } from '@reduxjs/toolkit';
import { visitsApi } from '../../api';
import { apiThunk, resetApp, toPage, listInitial, addListCases, addDetailCases, detailInitial } from '../helpers';

/** `{ page, search, status, date_filter, start_date, end_date }` — dates filter by visit date. */
export const fetchVisits = apiThunk('visits/fetchList', async (params = {}) => {
  const res = await visitsApi.list({ ...params, page: params.page || 1 });
  return toPage(res.data);
});

export const fetchVisit = apiThunk('visits/fetchOne', async (id) => {
  const res = await visitsApi.detail(id);
  return res.data;
});

/** Creates (or reuses, by mobile) a lead and schedules the visit. */
export const scheduleVisit = apiThunk('visits/schedule', async (body) => {
  const res = await visitsApi.create(body);
  return res.data;
});

export const attendVisit = apiThunk('visits/attend', async ({ id, remarks }, { dispatch }) => {
  const res = await visitsApi.attend(id, remarks);
  dispatch(fetchVisit(id));
  return res.data;
});

const initialState = { list: listInitial(), ...detailInitial() };

const markStale = (state) => {
  state.list.stale = true;
};

const visitsSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetApp, () => initialState);
    addListCases(builder, fetchVisits, (state) => state.list);
    addDetailCases(builder, fetchVisit);
    builder.addCase(scheduleVisit.fulfilled, markStale).addCase(attendVisit.fulfilled, markStale);
  },
});

export default visitsSlice.reducer;
