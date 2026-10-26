import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import {
  Avatar,
  Card,
  ChipRow,
  RoundIconButton,
  SearchBar,
  Segmented,
  StatusPill,
  EmptyState,
  ErrorState,
  LoadingState,
  LoadMore,
  FilterSheet,
} from '../components/ui';
import { colors, spacing, type, radius } from '../theme';
import { dateFilters, partnerTypes } from '../data';
import { humanize, orDash } from '../format';
import { usePermissions } from '../store';
import { fetchRegistrations } from '../store/slices/registrationsSlice';
import { startOnboarding } from '../store/slices/onboardingSlice';
import { hasMore } from '../store/helpers';
import { useDebounced, useRefetchWhenStale } from '../hooks';

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
];
const typeChips = [{ id: 'All', label: 'All' }, ...partnerTypes.map((p) => ({ id: p.id, label: p.label }))];

/** Figma frame: `complete-profile` @ 3977 (12:549) — the registrations list (staff). */
export default function RegistrationsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const list = useSelector((state) => state.registrations.list);
  const [tab, setTab] = useState('pending');
  const [query, setQuery] = useState('');
  const search = useDebounced(query.trim());
  const [partnerType, setPartnerType] = useState('All');
  const [date, setDate] = useState(dateFilters[0].label);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const params = useMemo(
    () => ({
      status: tab,
      search: search || undefined,
      date_filter: dateFilters.find((d) => d.label === date)?.id || undefined,
    }),
    [tab, search, date]
  );

  const load = (page = 1) => dispatch(fetchRegistrations({ ...params, page }));

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

  // No partner-type filter on the server; filter the loaded rows.
  const rows = useMemo(
    () => (partnerType === 'All' ? list.items : list.items.filter((r) => r.partner_type === partnerType)),
    [list.items, partnerType]
  );

  const activeFilters = (partnerType !== 'All' ? 1 : 0) + (date !== dateFilters[0].label ? 1 : 0);

  const addPartner = () => {
    dispatch(startOnboarding({ mode: 'admin' }));
    navigation.navigate('CompleteProfile');
  };

  if (!can('registration.view')) {
    return (
      <Screen showBack>
        <PageTitle>Registrations</PageTitle>
        <EmptyState icon="users" title="Not available" body="Registrations are managed by the Affinity Belgravia team." />
      </Screen>
    );
  }

  const firstLoad = list.status === 'loading' && list.page === 0;

  return (
    <Screen showBack refreshing={refreshing} onRefresh={onRefresh}>
      <PageTitle
        subtitle="View and track registered channel partners, brokers, influencers and freelancers"
        right={can('registration.add') ? <RoundIconButton name="plus" tone="dark" size={44} iconSize={20} onPress={addPartner} /> : null}
      >
        Registrations
      </PageTitle>

      <Segmented options={TABS} value={tab} onChange={setTab} style={{ marginHorizontal: spacing.xl }} />

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name, mobile or email"
        onFilterPress={() => setFiltersOpen(true)}
        filterCount={activeFilters}
        style={{ marginHorizontal: spacing.xl, marginTop: spacing.lg }}
      />

      <ChipRow
        options={typeChips}
        value={partnerType}
        onChange={setPartnerType}
        style={{ marginTop: spacing.lg }}
        contentStyle={{ paddingHorizontal: spacing.xl }}
      />

      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md }}>
        {rows.map((r) => (
          <Card key={r.id} style={s.card} onPress={() => navigation.navigate('RegistrationDetail', { id: r.id })}>
            <Avatar name={r.name} size={48} badge="user" />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{r.name}</Text>
              <StatusPill label={humanize(r.partner_type)} tone="warning" style={{ marginTop: spacing.xs }} />
              <Text style={s.meta}>{orDash(r.mobile)}</Text>
              {r.email ? <Text style={s.meta} numberOfLines={1}>{r.email}</Text> : null}
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch' }}>
              <Text style={s.date}>{r.registered_date}</Text>
              <Pressable style={s.viewBtn} onPress={() => navigation.navigate('RegistrationDetail', { id: r.id })}>
                <Text style={s.viewLabel}>View</Text>
              </Pressable>
            </View>
          </Card>
        ))}

        {firstLoad ? <LoadingState /> : null}
        {list.status === 'failed' && !list.items.length ? <ErrorState message={list.error} onRetry={() => load(1)} /> : null}
        {list.status === 'succeeded' && rows.length === 0 ? (
          <EmptyState icon="users" title="No registrations found" body="Try a different tab, filter or search term." />
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
        sections={[
          { id: 'type', title: 'Registration Type', options: typeChips.map((c) => c.label), value: typeChips.find((c) => c.id === partnerType)?.label },
          { id: 'date', title: 'Registered', options: dateFilters.map((d) => d.label), value: date },
        ]}
        onApply={(v) => {
          setPartnerType(typeChips.find((c) => c.label === v.type)?.id || 'All');
          setDate(v.date);
        }}
        onReset={() => {
          setPartnerType('All');
          setDate(dateFilters[0].label);
        }}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  name: { ...type.body, color: colors.onSurface },
  meta: { ...type.bodySmall, color: colors.muted, marginTop: 2 },
  date: { ...type.caption, color: colors.onSurfaceTertiary, textAlign: 'right' },
  viewBtn: {
    height: 30,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  viewLabel: { ...type.caption, color: colors.brandPrimary },
});
