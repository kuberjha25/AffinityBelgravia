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

/** Project documents, grouped by project. `{ page, project_id, search }` */
export const fetchDocuments = apiThunk('content/documents', async (params = {}) => {
  const res = await contentApi.documents({ ...params, page: params.page || 1 });
  return toPage(res.data);
});

const initialState = {
  news: listInitial(),
  ...detailInitial('newsItems'),
  promotions: listInitial(),
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
    addListCases(builder, fetchDocuments, (state) => state.documents);
  },
});

export default contentSlice.reducer;
