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
import { dateFilters, leadStatuses, leadTypes } from '../data';
import { humanize, orDash } from '../format';
import { usePermissions } from '../store';
import { fetchLeads } from '../store/slices/leadsSlice';
import { hasMore } from '../store/helpers';
import { useDebounced, useLookup, useRefetchWhenStale } from '../hooks';

const ALL = 'All';
const DEFAULTS = { status: '', type: ALL, source: ALL, date: dateFilters[0].label };

const statusChips = [{ id: '', label: 'All' }, ...leadStatuses.map((id) => ({ id, label: humanize(id) }))];

/**
 * Figma frame: `leads-list-screen` (12:1965).
 * CP / Broker / Influencer / Freelancer: read-only list of their own leads (#2) —
 * the backend scopes the list to the caller. Staff: "+" to add one (#3).
 */
export default function LeadsScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const canAdd = can('lead.add');
  const list = useSelector((state) => state.leads.list);
  const sources = useLookup('sources');
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
      lead_type: f.type === ALL ? undefined : leadTypes.find((t) => t.label === f.type)?.id,
      date_filter: dateFilters.find((d) => d.label === f.date)?.id || undefined,
    }),
    [search, f.status, f.type, f.date]
  );

  const load = (page = 1) => dispatch(fetchLeads({ ...params, page }));

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

  // The server ignores ?source=, so the source filter is applied here.
  const rows = useMemo(
    () => (f.source === ALL ? list.items : list.items.filter((l) => l.source === f.source)),
    [list.items, f.source]
  );

  const activeFilters = Object.keys(DEFAULTS).filter((k) => f[k] !== DEFAULTS[k]).length;

  const sourceNames = (sources.items || []).map((src) => src.name);
  const sections = [
    { id: 'status', title: 'Lead Status', options: statusChips.map((c) => c.label), value: statusChips.find((c) => c.id === f.status)?.label },
    { id: 'type', title: 'Lead Type', options: [ALL, ...leadTypes.map((t) => t.label)], value: f.type },
    { id: 'source', title: 'Lead Source', options: [ALL, ...sourceNames], value: f.source },
    { id: 'date', title: 'Created', options: dateFilters.map((d) => d.label), value: f.date },
  ];

  const applyFilters = (v) =>
    setF((prev) => ({
      ...prev,
      ...v,
      status: statusChips.find((c) => c.label === v.status)?.id ?? prev.status,
    }));

  const firstLoad = list.status === 'loading' && list.page === 0;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <PageTitle
        subtitle={can('lead.view.all') ? undefined : 'Leads brought in under your name (view only)'}
        right={
          canAdd ? (
            <RoundIconButton name="plus" tone="dark" size={44} iconSize={20} onPress={() => navigation.navigate('NewLead')} />
          ) : null
        }
      >
        Leads
      </PageTitle>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name, mobile, email or project"
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
        {list.status === 'succeeded' || list.items.length ? (
          <Text style={s.count}>{`${list.total} ${list.total === 1 ? 'lead' : 'leads'}`}</Text>
        ) : null}

        {rows.map((l) => (
          <Card key={l.id} onPress={() => navigation.navigate('LeadDetail', { id: l.id })}>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{l.full_name}</Text>
                <Text style={s.phone}>{orDash(l.mobile)}</Text>
              </View>
              <StatusPill label={humanize(l.status)} tone={toneForStatus(l.status)} />
            </View>

            <View style={[s.inline, { marginTop: spacing.md }]}>
              <Icon name="building" size={16} color={colors.brandPrimary} />
              <Text style={s.project} numberOfLines={1}>{orDash(l.project_name || l.project?.name)}</Text>
            </View>

            <View style={s.footerRow}>
              {l.source ? (
                <>
                  <Icon name="users" size={14} color={colors.muted} />
                  <Text style={s.meta} numberOfLines={1}>{l.source}</Text>
                </>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              <Text style={s.view}>View</Text>
              <Icon name="chevron-right" size={14} color={colors.muted} />
            </View>
          </Card>
        ))}

        {firstLoad ? <LoadingState /> : null}
        {list.status === 'failed' && !list.items.length ? <ErrorState message={list.error} onRetry={() => load(1)} /> : null}
        {list.status === 'succeeded' && rows.length === 0 ? (
          <EmptyState icon="users" title="No leads found" body={canAdd ? 'Try another filter or add a new lead.' : 'Try another filter.'} />
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
        onApply={applyFilters}
        onReset={() => setF(DEFAULTS)}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  count: { ...type.caption, color: colors.muted },
  name: { ...type.body, color: colors.onSurface },
  phone: { ...type.bodySmall, color: colors.muted, marginTop: 2 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  project: { ...type.body, color: colors.onSurface, flex: 1 },
  meta: { ...type.caption, color: colors.muted, flex: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  view: { ...type.caption, color: colors.muted },
});
