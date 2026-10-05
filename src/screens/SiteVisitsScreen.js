import React, { useMemo, useState } from 'react';
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
import { visitFilters } from '../data';
import { useApp } from '../store';

const SORTS = ['Latest visit first', 'Earliest visit first', 'Name A-Z'];

const MATCH = {
  Upcoming: ['Confirmed', 'Pending'],
  Completed: ['Completed'],
  Cancelled: ['Cancelled'],
};

/** Figma frame: `site-visits-screen` (12:859). */
export default function SiteVisitsScreen({ navigation }) {
  const { visits } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [sort, setSort] = useState(SORTS[0]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const projectOptions = useMemo(
    () => ['All', ...Array.from(new Set(visits.map((v) => v.project)))],
    [visits]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = visits.filter((v) => {
      if (filter !== 'All' && !MATCH[filter].includes(v.status)) return false;
      if (projectFilter !== 'All' && v.project !== projectFilter) return false;
      if (!q) return true;
      return v.name.toLowerCase().includes(q) || (v.phone || '').replace(/s/g, '').includes(q.replace(/s/g, ''));
    });
    if (sort === 'Name A-Z') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    const dir = sort === 'Earliest visit first' ? 1 : -1;
    const t = (v) => parseDisplayDate(v.date) || Date.now();
    return [...list].sort((a, b) => dir * (t(a) - t(b)));
  }, [visits, filter, projectFilter, sort, query]);

  const activeFilters =
    (filter !== 'All' ? 1 : 0) + (projectFilter !== 'All' ? 1 : 0) + (sort !== SORTS[0] ? 1 : 0);

  return (
    <Screen>
      <PageTitle
        right={
          <RoundIconButton
            name="plus"
            tone="dark"
            size={44}
            iconSize={20}
            onPress={() => navigation.navigate('ScheduleVisit')}
          />
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
        value={filter}
        onChange={setFilter}
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
          <EmptyState icon="calendar" title="No visits found" body="Adjust the filter or schedule a new visit." />
        ) : null}
      </View>

      <FilterSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sections={[
          { id: 'status', title: 'Visit Status', options: visitFilters, value: filter },
          { id: 'project', title: 'Project', options: projectOptions, value: projectFilter },
          { id: 'sort', title: 'Sort By', options: SORTS, value: sort },
        ]}
        onApply={(v) => {
          setFilter(v.status);
          setProjectFilter(v.project);
          setSort(v.sort);
        }}
        onReset={() => {
          setFilter('All');
          setProjectFilter('All');
          setSort(SORTS[0]);
        }}
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
