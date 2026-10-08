import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import {
  Card,
  ChipRow,
  RoundIconButton,
  SearchBar,
  StatusPill,
  EmptyState,
  toneForStatus,
  FilterSheet,
} from '../components/ui';
import { parseDisplayDate } from '../components/DateField';
import { colors, spacing, type } from '../theme';
import { visitFilters, staffMembers } from '../data';
import { matchesPhone } from '../format';
import { useApp } from '../store';

const SORTS = ['Latest visit first', 'Earliest visit first', 'Name A-Z'];
const DATE_RANGES = { 'Any time': null, 'Next 7 days': 7, 'Last 7 days': -7, 'Last 30 days': -30 };
const DAY = 24 * 60 * 60 * 1000;

const MATCH = {
  Upcoming: ['Confirmed', 'Pending'],
  Completed: ['Completed'],
  Cancelled: ['Cancelled'],
};

const DEFAULTS = {
  status: 'All',
  project: 'All',
  date: 'Any time',
  associate: 'All',
  staff: 'All',
  sort: SORTS[0],
};

/**
 * Figma frame: `site-visits-screen` (12:859).
 * CP / Freelancer / Influencer: view-only status of their own visits (#2).
 * Staff: every visit, plus "+" to schedule one on a CP's behalf (#3).
 */
export default function SiteVisitsScreen({ navigation, route }) {
  const { visits, can } = useApp();
  const canAdd = can('visit.add');
  const isStaffView = can('visit.view.all');
  const [query, setQuery] = useState('');
  const [f, setF] = useState(DEFAULTS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // #15: dashboard counts open this list pre-filtered.
  const presetStatus = route?.params?.status;
  useEffect(() => {
    if (presetStatus) setF({ ...DEFAULTS, status: presetStatus });
  }, [presetStatus, route?.params?.at]);

  const uniq = (key) => Array.from(new Set(visits.map((v) => v[key]).filter(Boolean)));
  const projectOptions = useMemo(() => ['All', ...uniq('project')], [visits]); // eslint-disable-line react-hooks/exhaustive-deps
  const associateOptions = useMemo(
    () => ['All', ...Array.from(new Set(visits.filter((v) => v.associateId).map((v) => v.bookedBy)))],
    [visits]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const days = DATE_RANGES[f.date];
    const now = Date.now();
    const t = (v) => parseDisplayDate(v.date) || now;
    const list = visits.filter((v) => {
      if (f.status !== 'All' && !MATCH[f.status].includes(v.status)) return false;
      if (f.project !== 'All' && v.project !== f.project) return false;
      if (f.associate !== 'All' && (!v.associateId || v.bookedBy !== f.associate)) return false;
      if (f.staff !== 'All' && v.assignedTo !== f.staff) return false;
      if (days > 0 && (t(v) < now - DAY || t(v) > now + days * DAY)) return false;
      if (days < 0 && (t(v) > now || t(v) < now + days * DAY)) return false;
      if (!q) return true;
      return v.name.toLowerCase().includes(q) || matchesPhone(v, q);
    });
    if (f.sort === 'Name A-Z') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    const dir = f.sort === 'Earliest visit first' ? 1 : -1;
    return [...list].sort((a, b) => dir * (t(a) - t(b)));
  }, [visits, f, query]);

  const activeFilters = Object.keys(DEFAULTS).filter((k) => f[k] !== DEFAULTS[k]).length;

  const sections = [
    { id: 'status', title: 'Visit Status', options: visitFilters },
    { id: 'project', title: 'Project', options: projectOptions },
    { id: 'date', title: 'Visit Date', options: Object.keys(DATE_RANGES) },
    ...(isStaffView
      ? [
          { id: 'associate', title: 'CP / Freelancer / Influencer', options: associateOptions },
          { id: 'staff', title: 'Assigned Staff', options: ['All', ...staffMembers] },
        ]
      : []),
    { id: 'sort', title: 'Sort By', options: SORTS },
  ].map((sec) => ({ ...sec, value: f[sec.id] }));

  return (
    <Screen>
      <PageTitle
        subtitle={isStaffView ? undefined : 'Status of visits booked under your name (view only)'}
        right={
          canAdd ? (
            <RoundIconButton
              name="plus"
              tone="dark"
              size={44}
              iconSize={20}
              onPress={() => navigation.navigate('ScheduleVisit')}
            />
          ) : null
        }
      >
        Project Visits
      </PageTitle>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        onFilterPress={() => setFiltersOpen(true)}
        filterCount={activeFilters}
        style={{ marginHorizontal: spacing.xl }}
      />

      <ChipRow
        options={visitFilters}
        value={f.status}
        onChange={(status) => setF((prev) => ({ ...prev, status }))}
        style={{ marginTop: spacing.lg }}
        contentStyle={{ paddingHorizontal: spacing.xl }}
      />

      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md }}>
        {rows.map((v) => (
          <Card key={v.id} onPress={() => navigation.navigate('VisitDetail', { id: v.id })}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text style={s.name}>{v.name}</Text>
                <Text style={s.meta}>
                  <Text style={s.metaLabel}>Project: </Text>
                  {v.project}
                </Text>
                <Text style={s.meta}>
                  <Text style={s.metaLabel}>Booked by: </Text>
                  {v.bookedBy}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end', gap: spacing.sm }}>
                <View style={s.inline}>
                  <Icon name="calendar" size={14} color={colors.brandPrimary} />
                  <Text style={s.date}>{v.date}</Text>
                </View>
                <View style={s.inline}>
                  <Icon name="clock" size={14} color={colors.brandPrimary} />
                  <Text style={s.time}>{v.time}</Text>
                </View>
                <StatusPill label={v.status} tone={toneForStatus(v.status)} />
              </View>
            </View>
          </Card>
        ))}

        {rows.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No visits found"
            body={canAdd ? 'Adjust the filter or schedule a new visit.' : 'Adjust the filter.'}
          />
        ) : null}
      </View>

      <FilterSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sections={sections}
        onApply={(v) => setF((prev) => ({ ...prev, ...v }))}
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
