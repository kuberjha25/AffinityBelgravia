import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import { SearchBar, EmptyState, ErrorState, LoadingState, LoadMore } from '../components/ui';
import { colors, radius, spacing, type, borderWidth, shadow } from '../theme';
import { images } from '../data';
import { imageFill } from '../components/fill';
import { humanize, imageSource, orDash } from '../format';
import { fetchProjects } from '../store/slices/projectsSlice';
import { hasMore } from '../store/helpers';
import { useDebounced } from '../hooks';

/**
 * Project list behind the Home "Project" tile. The review asked for the tile
 * to land on a list rather than jump straight into one project's details.
 */
export default function ProjectsScreen({ navigation }) {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.projects.list);
  const [query, setQuery] = useState('');
  const search = useDebounced(query.trim());
  const [refreshing, setRefreshing] = useState(false);

  const load = (page = 1) => dispatch(fetchProjects({ search: search || undefined, page }));

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(1);
    setRefreshing(false);
  };

  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }} refreshing={refreshing} onRefresh={onRefresh}>
      <PageTitle subtitle="Select a project to view details, inventory and documents">Projects</PageTitle>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search by project name or city"
        style={{ marginHorizontal: spacing.xl, marginBottom: spacing.lg }}
      />

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
        {list.items.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => navigation.navigate('ProjectDetail', { id: p.id })}
            style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}
          >
            <View style={s.imageWrap}>
              <Image source={imageSource(p.image_url, images.heroProject)} style={imageFill} resizeMode="cover" />
              <LinearGradient colors={['rgba(28,27,25,0)', 'rgba(28,27,25,0.75)']} style={StyleSheet.absoluteFill} />
              <View style={s.imageCopy}>
                <Text style={s.name} numberOfLines={1} adjustsFontSizeToFit>{String(p.name || '').toUpperCase()}</Text>
                <View style={s.inline}>
                  <Icon name="map-pin" size={14} color={colors.brandTertiary} />
                  <Text style={s.location}>{[p.city, p.state].filter(Boolean).join(', ') || '—'}</Text>
                </View>
              </View>
            </View>

            <View style={s.metaRow}>
              <Meta label="Type" value={p.type ? humanize(p.type) : '—'} />
              <View style={s.metaDivider} />
              <Meta label="Towers" value={orDash(p.towers_count)} />
              <View style={s.metaDivider} />
              <Meta label="Units" value={orDash(p.units_count)} highlight />
            </View>

            <View style={s.footer}>
              <Text style={s.possession}>{`Possession: ${orDash(p.possession_date)}`}</Text>
              <View style={s.inline}>
                <Text style={s.view}>View Details</Text>
                <Icon name="chevron-right" size={16} color={colors.brandPrimary} />
              </View>
            </View>
          </Pressable>
        ))}

        {list.status === 'loading' && list.page === 0 ? <LoadingState /> : null}
        {list.status === 'failed' && !list.items.length ? <ErrorState message={list.error} onRetry={() => load(1)} /> : null}
        {list.status === 'succeeded' && !list.items.length ? (
          <EmptyState icon="layers" title="No projects found" body={search ? 'Try another search.' : 'Projects will appear here once added.'} />
        ) : null}
        <LoadMore visible={hasMore(list)} loading={list.status === 'loading' && list.page > 0} onPress={() => load(list.page + 1)} />
      </View>
    </Screen>
  );
}

function Meta({ label, value, highlight }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4 }}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={[s.metaValue, highlight && { color: colors.brandPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.xl,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  imageWrap: { height: 180, justifyContent: 'flex-end' },
  imageCopy: { padding: spacing.lg },
  name: { ...type.title, fontSize: 20, color: colors.onSurfaceInverse, letterSpacing: 3 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
  location: { ...type.bodySmall, color: 'rgba(255,255,255,0.9)' },

  metaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
  metaDivider: { width: 1, height: 32, backgroundColor: colors.divider },
  metaLabel: { ...type.caption, color: colors.muted },
  metaValue: { ...type.bodySmall, color: colors.onSurface, marginTop: 2 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: borderWidth.default,
    borderTopColor: colors.divider,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  possession: { ...type.caption, color: colors.onSurfaceTertiary },
  view: { ...type.bodySmall, color: colors.brandPrimary },
});
