import { createSlice } from '@reduxjs/toolkit';
import { notificationsApi } from '../../api';
import { apiThunk, resetApp } from '../helpers';

/** Latest 20 notifications for the signed-in user (not paginated). */
export const fetchNotifications = apiThunk('notifications/fetch', async () => {
  const res = await notificationsApi.list();
  return Array.isArray(res.data) ? res.data : [];
});

export const markNotificationRead = apiThunk('notifications/markRead', async (id) => {
  await notificationsApi.markRead(id);
  return id;
});

/** There is no "mark all" endpoint, so this marks each unread one in turn. */
export const markAllNotificationsRead = apiThunk('notifications/markAllRead', async (_, { getState, dispatch }) => {
  const unread = getState().notifications.items.filter((n) => !n.is_read);
  await Promise.all(unread.map((n) => dispatch(markNotificationRead(n.id))));
  return true;
});

const initialState = { items: [], status: 'idle', error: null };

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(resetApp, () => initialState)
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.items = payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Optimistic: show it read straight away.
      .addCase(markNotificationRead.pending, (state, action) => {
        const item = state.items.find((n) => n.id === action.meta.arg);
        if (item) item.is_read = true;
      });
  },
});

export default notificationsSlice.reducer;

export const selectUnreadCount = (state) => state.notifications.items.filter((n) => !n.is_read).length;
