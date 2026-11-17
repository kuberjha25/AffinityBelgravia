import { createSlice } from '@reduxjs/toolkit';
import { contentApi } from '../../api';
import { apiThunk, resetApp, toPage, listInitial, addListCases, addDetailCases, detailInitial } from '../helpers';

/** `{ page, category, search }` */
export const fetchNews = apiThunk('content/news', async (params = {}) => {
  const res = await contentApi.news({ ...params, page: params.page || 1 });
  return toPage(res.data);
});

export const fetchNewsItem = apiThunk('content/newsItem', async (id) => {
  const res = await contentApi.newsItem(id);
  return res.data;
});

/** `{ page, search, project_id, promotion_type }` */
export const fetchPromotions = apiThunk('content/promotions', async (params = {}) => {
  const res = await contentApi.promotions({ ...params, page: params.page || 1 });
  return toPage(res.data);
});

export const fetchPromotion = apiThunk('content/promotion', async (id) => {
  const res = await contentApi.promotion(id);
  return res.data;
});

/** Event RSVP (`promotion_type: "event"` only). `{ id, status }` → the API message. */
export const rsvpPromotion = apiThunk('content/rsvp', async ({ id, status }) => {
  const res = await contentApi.rsvp(id, status);
  return res.message || 'Your RSVP has been recorded successfully.';
});

/** Project documents, grouped by project. `{ page, project_id, search }` */
export const fetchDocuments = apiThunk('content/documents', async (params = {}) => {
  const res = await contentApi.documents({ ...params, page: params.page || 1 });
  return toPage(res.data);
});

const initialState = {
  news: listInitial(),
  ...detailInitial('newsItems'),
  promotions: listInitial(),
  ...detailInitial('promotionItems'),
  documents: listInitial(),
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetApp, () => initialState);
    addListCases(builder, fetchNews, (state) => state.news);
    addDetailCases(builder, fetchNewsItem, 'newsItems');
    addListCases(builder, fetchPromotions, (state) => state.promotions);
    addDetailCases(builder, fetchPromotion, 'promotionItems');
    builder.addCase(rsvpPromotion.fulfilled, (state, action) => {
      const { id, status } = action.meta.arg;
      if (state.promotionItems[id]) state.promotionItems[id].rsvp_status = status;
      const row = state.promotions.items.find((p) => p.id === id);
      if (row) row.rsvp_status = status;
    });
    addListCases(builder, fetchDocuments, (state) => state.documents);
  },
});

export default contentSlice.reducer;
