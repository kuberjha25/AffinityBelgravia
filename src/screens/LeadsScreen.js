import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
import { leadFilters, leadStatuses } from '../data';

const SORTS = ['Recently active', 'Oldest first', 'Name A-Z'];
import { useApp } from '../store';

const TYPE_COLOR = {
  Hot: colors.error,
  Warm: colors.brandPrimary,
  Cold: colors.info,
};

/** Figma frame: `leads-list-screen` (12:1965). */
export default function LeadsScreen({ navigation }) {
  const { leads } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [leadType, setLeadType] = useState('All');
  const [sort, setSort] = useState(SORTS[0]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const counts = useMemo(() => {
    const map = {};
    leads.forEach((l) => {
      map[l.status] = (map[l.status] || 0) + 1;
    });
    return map;
  }, [leads]);

  const options = useMemo(
    () => leadFilters.map((f) => (f.id === 'All' ? f : { ...f, count: counts[f.id] ?? 0 })),
    [counts]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = leads.filter((l) => {
      if (filter !== 'All' && l.status !== filter) return false;
      if (leadType !== 'All' && l.type !== leadType) return false;
      if (!q) return true;
      return l.name.toLowerCase().includes(q) || l.phone.replace(/s/g, '').includes(q.replace(/s/g, ''));
    });
    if (sort === 'Name A-Z') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    const dir = sort === 'Oldest first' ? 1 : -1;
    // New leads have no parseable date yet ("Today"), so they sort as newest.
    const t = (l) => parseDisplayDate(l.activeOn) || Date.now();
    return [...list].sort((a, b) => dir * (t(a) - t(b)));
  }, [leads, filter, leadType, sort, query]);

  const activeFilters =
    (filter !== 'All' ? 1 : 0) + (leadType !== 'All' ? 1 : 0) + (sort !== SORTS[0] ? 1 : 0);

  return (
    <Screen>
      <PageTitle
        right={
          <RoundIconButton
            name="plus"
            tone="dark"
            size={44}
            iconSize={20}
            onPress={() => navigation.navigate('NewLead')}
          />
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
        value={filter}
        onChange={setFilter}
        style={{ marginTop: spacing.lg }}
        contentStyle={{ paddingHorizontal: spacing.xl }}
      />

      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md }}>
        {rows.map((l) => (
          <Card key={l.id} onPress={() => navigation.navigate('LeadDetail', { id: l.id })}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{l.name}</Text>
                <Text style={s.phone}>{l.phone}</Text>
              </View>
              <StatusPill label={l.status} tone={toneForStatus(l.status)} />
            </View>

            <View style={[s.inline, { marginTop: spacing.md }]}>
              <Icon name="building" size={16} color={colors.brandPrimary} />
              <Text style={s.project} numberOfLines={1}>{l.project}</Text>
            </View>

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
          <EmptyState icon="users" title="No leads found" body="Try another filter or add a new lead." />
        ) : null}
      </View>

      <FilterSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sections={[
          { id: 'status', title: 'Lead Status', options: ['All', ...leadStatuses], value: filter },
          { id: 'type', title: 'Lead Type', options: ['All', 'Hot', 'Warm', 'Cold'], value: leadType },
          { id: 'sort', title: 'Sort By', options: SORTS, value: sort },
        ]}
        onApply={(v) => {
          setFilter(v.status);
          setLeadType(v.type);
          setSort(v.sort);
        }}
        onReset={() => {
          setFilter('All');
          setLeadType('All');
          setSort(SORTS[0]);
        }}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  name: { ...type.body, color: colors.onSurface },
  phone: { ...type.bodySmall, color: colors.muted, marginTop: 2 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  project: { ...type.body, color: colors.onSurface, flex: 1 },
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
