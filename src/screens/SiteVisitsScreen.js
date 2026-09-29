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
} from '../components/ui';
import { colors, spacing, type } from '../theme';
import { visitFilters } from '../data';
import { useApp } from '../store';

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

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visits.filter((v) => {
      if (filter !== 'All' && !MATCH[filter].includes(v.status)) return false;
      if (!q) return true;
      return v.name.toLowerCase().includes(q) || (v.phone || '').includes(q);
    });
  }, [visits, filter, query]);

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
        onFilterPress={() => setFilter('All')}
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
