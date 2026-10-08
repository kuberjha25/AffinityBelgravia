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
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { leadFilters, leadStatuses, staffMembers } from '../data';
import { customerCategories, leadSources } from '../config';
import { displayMobile, matchesPhone } from '../format';
import { useApp } from '../store';

const SORTS = ['Recently active', 'Oldest first', 'Name A-Z'];
const DATE_RANGES = { 'Any time': 0, 'Last 7 days': 7, 'Last 30 days': 30, 'Last 90 days': 90 };
const DAY = 24 * 60 * 60 * 1000;

const DEFAULTS = {
  status: 'All',
  type: 'All',
  source: 'All',
  category: 'All',
  date: 'Any time',
  associate: 'All',
  staff: 'All',
  sort: SORTS[0],
};

const TYPE_COLOR = {
  Hot: colors.error,
  Warm: colors.brandPrimary,
  Cold: colors.info,
};

/**
 * Figma frame: `leads-list-screen` (12:1965).
 * CP / Freelancer / Influencer: read-only list of their own leads (#2).
 * Staff: every lead, plus "+" to add one (#3).
 */
export default function LeadsScreen({ navigation, route }) {
  const { leads, can } = useApp();
  const canAdd = can('lead.add');
  const isStaffView = can('lead.view.all');
  const [query, setQuery] = useState('');
  const [f, setF] = useState(DEFAULTS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // #15: dashboard counts open this list pre-filtered.
  const presetStatus = route?.params?.status;
  useEffect(() => {
    if (presetStatus) setF({ ...DEFAULTS, status: presetStatus });
  }, [presetStatus, route?.params?.at]);

  const counts = useMemo(() => {
    const map = {};
    leads.forEach((l) => {
      map[l.status] = (map[l.status] || 0) + 1;
    });
    return map;
  }, [leads]);

  const options = useMemo(
    () => leadFilters.map((o) => (o.id === 'All' ? o : { ...o, count: counts[o.id] ?? 0 })),
    [counts]
  );

  const associateNames = useMemo(
    () => Array.from(new Set(leads.map((l) => l.associateName).filter(Boolean))),
    [leads]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const since = DATE_RANGES[f.date] ? Date.now() - DATE_RANGES[f.date] * DAY : 0;
    const t = (l) => parseDisplayDate(l.activeOn) || Date.now(); // new leads ("Today") count as newest
    const list = leads.filter((l) => {
      if (f.status !== 'All' && l.status !== f.status) return false;
      if (f.type !== 'All' && l.type !== f.type) return false;
      if (f.source !== 'All' && l.source !== f.source) return false;
      if (f.category !== 'All' && l.category !== f.category) return false;
      if (f.associate !== 'All' && l.associateName !== f.associate) return false;
      if (f.staff !== 'All' && l.assignedTo !== f.staff) return false;
      if (since && t(l) < since) return false;
      if (!q) return true;
      return l.name.toLowerCase().includes(q) || matchesPhone(l, q);
    });
    if (f.sort === 'Name A-Z') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    const dir = f.sort === 'Oldest first' ? 1 : -1;
    return [...list].sort((a, b) => dir * (t(a) - t(b)));
  }, [leads, f, query]);

  const activeFilters = Object.keys(DEFAULTS).filter((k) => f[k] !== DEFAULTS[k]).length;

  const sections = [
    { id: 'status', title: 'Lead Status', options: ['All', ...leadStatuses] },
    { id: 'type', title: 'Lead Type', options: ['All', 'Hot', 'Warm', 'Cold'] },
    { id: 'source', title: 'Lead Source', options: ['All', ...leadSources.map((src) => src.label)] },
    { id: 'category', title: 'Customer Category', options: ['All', ...customerCategories] },
    { id: 'date', title: 'Last Activity', options: Object.keys(DATE_RANGES) },
    ...(isStaffView
      ? [
          { id: 'associate', title: 'CP / Freelancer / Influencer', options: ['All', ...associateNames] },
          { id: 'staff', title: 'Assigned Staff', options: ['All', ...staffMembers] },
        ]
      : []),
    { id: 'sort', title: 'Sort By', options: SORTS },
  ].map((sec) => ({ ...sec, value: f[sec.id] }));

  return (
    <Screen>
      <PageTitle
        subtitle={isStaffView ? undefined : 'Leads brought in under your name (view only)'}
        right={
          canAdd ? (
            <RoundIconButton
              name="plus"
              tone="dark"
              size={44}
              iconSize={20}
              onPress={() => navigation.navigate('NewLead')}
            />
          ) : null
        }
      >
        Leads
      </PageTitle>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        onFilterPress={() => setFiltersOpen(true)}
        filterCount={activeFilters}
        style={{ marginHorizontal: spacing.xl }}
      />

      <ChipRow
        options={options}
        value={f.status}
        onChange={(status) => setF((prev) => ({ ...prev, status }))}
        style={{ marginTop: spacing.lg }}
        contentStyle={{ paddingHorizontal: spacing.xl }}
      />

      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md }}>
        {rows.map((l) => (
          <Card key={l.id} onPress={() => navigation.navigate('LeadDetail', { id: l.id })}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{l.name}</Text>
                <Text style={s.phone}>{displayMobile(l)}</Text>
              </View>
              <StatusPill label={l.status} tone={toneForStatus(l.status)} />
            </View>

            <View style={[s.inline, { marginTop: spacing.md }]}>
              <Icon name="building" size={16} color={colors.brandPrimary} />
              <Text style={s.project} numberOfLines={1}>{l.project}</Text>
            </View>

            {isStaffView && l.associateName ? (
              <View style={[s.inline, { marginTop: spacing.xs }]}>
                <Icon name="user" size={14} color={colors.muted} />
                <Text style={s.meta} numberOfLines={1}>{`Via ${l.associateName}`}</Text>
              </View>
            ) : null}

            <View style={s.footerRow}>
              <View style={[s.typeChip, { borderColor: TYPE_COLOR[l.type] }]}>
                <Text style={[s.typeLabel, { color: TYPE_COLOR[l.type] }]}>{l.type}</Text>
              </View>
              <Text style={s.active}>{`Active: ${l.activeOn}`}</Text>
              <View style={{ flex: 1 }} />
              <Text style={s.view}>View</Text>
              <Icon name="chevron-right" size={14} color={colors.muted} />
            </View>
          </Card>
        ))}

        {rows.length === 0 ? (
          <EmptyState
            icon="users"
            title="No leads found"
            body={canAdd ? 'Try another filter or add a new lead.' : 'Try another filter.'}
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
  phone: { ...type.bodySmall, color: colors.muted, marginTop: 2 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  project: { ...type.body, color: colors.onSurface, flex: 1 },
  meta: { ...type.caption, color: colors.muted, flex: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  typeChip: {
    height: 24,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: borderWidth.default,
    justifyContent: 'center',
  },
  typeLabel: { ...type.caption },
  active: { ...type.caption, color: colors.brandPrimary },
  view: { ...type.caption, color: colors.muted },
});
