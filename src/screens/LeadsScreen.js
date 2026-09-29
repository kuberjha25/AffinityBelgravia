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
} from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { leadFilters } from '../data';
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
    return leads.filter((l) => {
      if (filter !== 'All' && l.status !== filter) return false;
      if (!q) return true;
      return l.name.toLowerCase().includes(q) || l.phone.includes(q);
    });
  }, [leads, filter, query]);

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
        onFilterPress={() => setFilter('All')}
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
