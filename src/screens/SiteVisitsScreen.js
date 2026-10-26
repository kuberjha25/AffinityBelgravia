import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import {
  Card,
  ChipRow,
  RoundIconButton,
  SearchBar,
  StatusPill,
  EmptyState,
  ErrorState,
  LoadingState,
  LoadMore,
  toneForStatus,
  FilterSheet,
} from '../components/ui';
import { colors, spacing, type } from '../theme';
import { dateFilters, visitStatuses } from '../data';
import { fromApiDate, humanize } from '../format';
import { usePermissions } from '../store';
import { fetchVisits } from '../store/slices/visitsSlice';
import { hasMore } from '../store/helpers';
import { useDebounced, useRefetchWhenStale } from '../hooks';

const statusChips = [{ id: '', label: 'All' }, ...visitStatuses.map((id) => ({ id, label: humanize(id) }))];
const DEFAULTS = { status: '', date: dateFilters[0].label };

/** "10:00" → "10:00 AM" */
const clock = (hhmm) => {
  const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hhmm || '';
  const h = Number(m[1]);
  return `${((h + 11) % 12) + 1}:${m[2]} ${h < 12 ? 'AM' : 'PM'}`;
};

/**
 * Figma frame: `site-visits-screen` (12:859).
 * CP / Broker / Influencer / Freelancer: view-only status of their own visits (#2).
 * Staff: "+" to schedule one (#3).
 */
export default function SiteVisitsScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const canAdd = can('visit.add');
  const list = useSelector((state) => state.visits.list);
  const [query, setQuery] = useState('');
  const search = useDebounced(query.trim());
  // #15: dashboard counts open this list pre-filtered.
  const presetStatus = route?.params?.status;
  const [f, setF] = useState(() => ({ ...DEFAULTS, status: presetStatus ?? '' }));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (presetStatus !== undefined) setF({ ...DEFAULTS, status: presetStatus });
  }, [presetStatus, route?.params?.at]);

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: f.status || undefined,
      date_filter: dateFilters.find((d) => d.label === f.date)?.id || undefined,
    }),
    [search, f.status, f.date]
  );

  const load = (page = 1) => dispatch(fetchVisits({ ...params, page }));

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useRefetchWhenStale(list.stale, () => load(1));

  const onRefresh = async () => {
    setRefreshing(true);
    await load(1);
    setRefreshing(false);
  };

  const activeFilters = Object.keys(DEFAULTS).filter((k) => f[k] !== DEFAULTS[k]).length;

  const sections = [
    { id: 'status', title: 'Visit Status', options: statusChips.map((c) => c.label), value: statusChips.find((c) => c.id === f.status)?.label },
    { id: 'date', title: 'Visit Date', options: dateFilters.map((d) => d.label), value: f.date },
  ];

  const firstLoad = list.status === 'loading' && list.page === 0;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <PageTitle
        subtitle={can('visit.view.all') ? undefined : 'Status of visits booked under your name (view only)'}
        right={
          canAdd ? (
            <RoundIconButton name="plus" tone="dark" size={44} iconSize={20} onPress={() => navigation.navigate('ScheduleVisit')} />
          ) : null
        }
      >
        Project Visits
      </PageTitle>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search by visitor name or mobile"
        onFilterPress={() => setFiltersOpen(true)}
        filterCount={activeFilters}
        style={{ marginHorizontal: spacing.xl }}
      />

      <ChipRow
        options={statusChips}
        value={f.status}
        onChange={(status) => setF((prev) => ({ ...prev, status }))}
        style={{ marginTop: spacing.lg }}
        contentStyle={{ paddingHorizontal: spacing.xl }}
      />

      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md }}>
        {list.items.map((v) => (
          <Card key={v.id} onPress={() => navigation.navigate('VisitDetail', { id: v.id })}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text style={s.name}>{v.visitor_name}</Text>
                <Text style={s.meta}>
                  <Text style={s.metaLabel}>Project: </Text>
                  {v.project_name || '—'}
                </Text>
                {v.visit_type ? (
                  <Text style={s.meta}>
                    <Text style={s.metaLabel}>Visit type: </Text>
                    {humanize(v.visit_type)}
                  </Text>
                ) : null}
              </View>

              <View style={{ alignItems: 'flex-end', gap: spacing.sm }}>
                <View style={s.inline}>
                  <Icon name="calendar" size={14} color={colors.brandPrimary} />
                  <Text style={s.date}>{fromApiDate(v.visit_date)}</Text>
                </View>
                {v.visit_time ? (
                  <View style={s.inline}>
                    <Icon name="clock" size={14} color={colors.brandPrimary} />
                    <Text style={s.time}>{clock(v.visit_time)}</Text>
                  </View>
                ) : null}
                <StatusPill label={humanize(v.status)} tone={toneForStatus(v.status)} />
              </View>
            </View>
          </Card>
        ))}

        {firstLoad ? <LoadingState /> : null}
        {list.status === 'failed' && !list.items.length ? <ErrorState message={list.error} onRetry={() => load(1)} /> : null}
        {list.status === 'succeeded' && list.items.length === 0 ? (
          <EmptyState icon="calendar" title="No visits found" body={canAdd ? 'Adjust the filter or schedule a new visit.' : 'Adjust the filter.'} />
        ) : null}

        <LoadMore
          visible={hasMore(list)}
          loading={list.status === 'loading' && list.page > 0}
          onPress={() => load(list.page + 1)}
        />
      </View>

      <FilterSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sections={sections}
        onApply={(v) =>
          setF((prev) => ({ ...prev, date: v.date, status: statusChips.find((c) => c.label === v.status)?.id ?? prev.status }))
        }
        onReset={() => setF(DEFAULTS)}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  name: { ...type.body, color: colors.onSurface },
  meta: { ...type.bodySmall, color: colors.onSurface, marginTop: spacing.xs },
  metaLabel: { color: colors.muted },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  date: { ...type.bodySmall, color: colors.onSurface },
  time: { ...type.bodySmall, color: colors.onSurface, letterSpacing: 1 },
});
