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
} from '../components/ui';
import { colors, spacing, type, radius } from '../theme';
import { registrationFilters } from '../data';
import { useApp } from '../store';

/** Figma frame: `complete-profile` @ 3977 (12:549) — the registrations list. */
export default function RegistrationsScreen({ navigation }) {
  const { registrations } = useApp();
  const [tab, setTab] = useState('Pending');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registrations.filter((r) => {
      if (r.status !== tab) return false;
      if (filter !== 'All' && r.type !== filter) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.phone.includes(q);
    });
  }, [registrations, tab, filter, query]);

  return (
    <Screen>
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
        onFilterPress={() => setFilter('All')}
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
