import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen, { PageTitle } from '../components/Screen';
import { ChipRow, EmptyState } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { news, newsFilters } from '../data';
import { imageFill } from '../components/fill';

const { width } = Dimensions.get('window');
const GAP = spacing.md;
const CARD_W = (width - spacing.lg * 2 - GAP) / 2;

/** Figma frame: `news-screen` (12:2616). */
export default function NewsScreen({ navigation }) {
  const [filter, setFilter] = useState('All');

  const rows = useMemo(
    () => (filter === 'All' ? news : news.filter((n) => n.tag === filter)),
    [filter]
  );

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <PageTitle>News Feed</PageTitle>

      <ChipRow
        options={newsFilters}
        value={filter}
        onChange={setFilter}
        contentStyle={{ paddingHorizontal: spacing.lg }}
      />

      <View style={s.grid}>
        {rows.map((item) => (
          <Pressable
            key={item.id}
            style={s.card}
            onPress={() => navigation.navigate('NewsDetail', { id: item.id })}
          >
            <Image source={item.thumb} style={imageFill} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(28,27,25,0.15)', 'rgba(28,27,25,0.82)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.cardBody}>
              <Text style={s.cardTitle} numberOfLines={3}>{item.title}</Text>
              <View style={s.cardFooter}>
                <View style={s.tag}>
                  <Text style={s.tagLabel}>{item.tag}</Text>
                </View>
                <Text style={s.date}>{item.date}</Text>
              </View>
            </View>
          </Pressable>
        ))}

        {rows.length === 0 ? (
          <EmptyState icon="newspaper" title="No stories yet" body="Nothing filed under this category." />
        ) : null}
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
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: {
    height: 22,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(28,27,25,0.7)',
    justifyContent: 'center',
  },
  tagLabel: { ...type.caption, color: colors.onSurfaceInverse },
  date: { ...type.caption, color: 'rgba(255,255,255,0.86)' },
});
