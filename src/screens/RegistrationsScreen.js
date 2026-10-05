import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import {
  Avatar,
  Card,
  ChipRow,
  RoundIconButton,
  SearchBar,
  Segmented,
  StatusPill,
  EmptyState,
  FilterSheet,
} from '../components/ui';
import { parseDisplayDate } from '../components/DateField';
import { colors, spacing, type, radius } from '../theme';
import { registrationFilters } from '../data';

const SORTS = ['Newest first', 'Oldest first', 'Name A-Z'];
import { useApp } from '../store';

/** Figma frame: `complete-profile` @ 3977 (12:549) — the registrations list. */
export default function RegistrationsScreen({ navigation }) {
  const { registrations } = useApp();
  const [tab, setTab] = useState('Pending');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState(SORTS[0]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = registrations.filter((r) => {
      if (r.status !== tab) return false;
      if (filter !== 'All' && r.type !== filter) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.phone.replace(/s/g, '').includes(q.replace(/s/g, ''));
    });
    if (sort === 'Name A-Z') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    const dir = sort === 'Oldest first' ? 1 : -1;
    return [...list].sort((a, b) => dir * (parseDisplayDate(a.date) - parseDisplayDate(b.date)));
  }, [registrations, tab, filter, sort, query]);

  const activeFilters = (filter !== 'All' ? 1 : 0) + (sort !== SORTS[0] ? 1 : 0);

  return (
    <Screen showBack>
      <PageTitle
        subtitle="View and track all registered influencers and brokers"
        right={
          <RoundIconButton
            name="plus"
            tone="dark"
            size={44}
            iconSize={20}
            onPress={() => navigation.navigate('CompleteProfile')}
          />
        }
      >
        Registrations
      </PageTitle>

      <Segmented
        options={['Pending', 'Completed']}
        value={tab}
        onChange={setTab}
        style={{ marginHorizontal: spacing.xl }}
      />

      <SearchBar
        value={query}
        onChangeText={setQuery}
        onFilterPress={() => setFiltersOpen(true)}
        filterCount={activeFilters}
        style={{ marginHorizontal: spacing.xl, marginTop: spacing.lg }}
      />

      <ChipRow
        options={registrationFilters}
        value={filter}
        onChange={setFilter}
        style={{ marginTop: spacing.lg }}
        contentStyle={{ paddingHorizontal: spacing.xl }}
      />

      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md }}>
        {rows.map((r) => (
          <Card key={r.id} style={s.card}>
            <Avatar source={r.avatar} name={r.name} size={48} badge="user" />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{r.name}</Text>
              <StatusPill label={r.type} tone="warning" style={{ marginTop: spacing.xs }} />
              <Text style={s.meta}>{r.phone}</Text>
              <Text style={s.meta}>{r.email}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch' }}>
              <Text style={s.date}>{r.date}</Text>
              <Pressable
                style={s.viewBtn}
                onPress={() => navigation.navigate('RegistrationDetail', { id: r.id })}
              >
                <Text style={s.viewLabel}>View</Text>
              </Pressable>
            </View>
          </Card>
        ))}

        {rows.length === 0 ? (
          <EmptyState
            icon="users"
            title="No registrations found"
            body="Try a different tab, filter or search term."
          />
        ) : null}
      </View>

      <FilterSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sections={[
          { id: 'type', title: 'Registration Type', options: registrationFilters, value: filter },
          { id: 'sort', title: 'Sort By', options: SORTS, value: sort },
        ]}
        onApply={(v) => {
          setFilter(v.type);
          setSort(v.sort);
        }}
        onReset={() => {
          setFilter('All');
          setSort(SORTS[0]);
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
