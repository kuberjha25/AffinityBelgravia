import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import { ChipRow, EmptyState, ErrorState, LoadingState, LoadMore } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { images, newsCategories } from '../data';
import { imageFill } from '../components/fill';
import { fromApiDate, humanize, imageSource } from '../format';
import { fetchNews } from '../store/slices/contentSlice';
import { hasMore } from '../store/helpers';

const { width } = Dimensions.get('window');
const GAP = spacing.md;
const CARD_W = (width - spacing.lg * 2 - GAP) / 2;

const chips = [{ id: '', label: 'All' }, ...newsCategories.map((id) => ({ id, label: humanize(id) }))];

/** Figma frame: `news-screen` (12:2616). */
export default function NewsScreen({ navigation }) {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.content.news);
  const [category, setCategory] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = (page = 1) => dispatch(fetchNews({ category: category || undefined, page }));

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(1);
    setRefreshing(false);
  };

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing.xxl }} refreshing={refreshing} onRefresh={onRefresh}>
      <PageTitle>News Feed</PageTitle>

      <ChipRow options={chips} value={category} onChange={setCategory} contentStyle={{ paddingHorizontal: spacing.lg }} />

      <View style={s.grid}>
        {list.items.map((item) => (
          <Pressable key={item.id} style={s.card} onPress={() => navigation.navigate('NewsDetail', { id: item.id })}>
            <Image source={imageSource(item.image_url, images.heroNews)} style={imageFill} resizeMode="cover" />
            <LinearGradient colors={['rgba(28,27,25,0.15)', 'rgba(28,27,25,0.82)']} style={StyleSheet.absoluteFill} />
            <View style={s.cardBody}>
              <Text style={s.cardTitle} numberOfLines={3}>{item.title}</Text>
              <View style={s.cardFooter}>
                {item.category ? (
                  <View style={s.tag}>
                    <Text style={s.tagLabel} numberOfLines={1}>{humanize(item.category)}</Text>
                  </View>
                ) : (
                  <View />
                )}
                <Text style={s.date}>{fromApiDate(item.publish_date)}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ paddingHorizontal: spacing.lg }}>
        {list.status === 'loading' && list.page === 0 ? <LoadingState /> : null}
        {list.status === 'failed' && !list.items.length ? <ErrorState message={list.error} onRetry={() => load(1)} /> : null}
        {list.status === 'succeeded' && !list.items.length ? (
          <EmptyState icon="newspaper" title="No stories yet" body="Nothing filed under this category." />
        ) : null}
        <LoadMore visible={hasMore(list)} loading={list.status === 'loading' && list.page > 0} onPress={() => load(list.page + 1)} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  card: {
    width: CARD_W,
    height: 188,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cardBody: { padding: spacing.md, gap: spacing.sm },
  cardTitle: { ...type.bodySmall, color: colors.onSurfaceInverse },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  tag: {
    flexShrink: 1,
    height: 22,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(28,27,25,0.7)',
    justifyContent: 'center',
  },
  tagLabel: { ...type.caption, color: colors.onSurfaceInverse },
  date: { ...type.caption, color: 'rgba(255,255,255,0.86)' },
});
