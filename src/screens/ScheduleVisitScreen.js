import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import DateField from '../components/DateField';
import { TextField, SelectField, StateCityFields, PrimaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { leadTypes, project, visitTimeSlots } from '../data';

/**
 * Who the visit is for. "Myself" = the broker visiting the site personally
 * (their own details are pre-filled); "Client" = the broker booking for a
 * customer, whose details are entered manually.
 */
const VISITOR_OPTIONS = [
  { id: 'broker', label: 'Myself', icon: 'user', hint: 'You are visiting the site yourself. Your details are filled in below.' },
  { id: 'client', label: 'Client', icon: 'users', hint: "You are booking a visit for your client. Enter the client's details below." },
];
import { useApp } from '../store';

const TYPE_TONE = {
  Hot: { fg: colors.error, bg: 'rgba(180,83,74,0.10)' },
  Warm: { fg: colors.error, bg: 'rgba(180,83,74,0.10)' },
  Cold: { fg: colors.success, bg: colors.surfaceSecondary },
};

/** Figma frame: `schedule-visit-screen` (12:1176). */
export default function ScheduleVisitScreen({ navigation }) {
  const { addVisit, profile } = useApp();
  const [role, setRole] = useState('broker');
  const selfDetails = { name: profile.name, phone: profile.phone, email: profile.email };
  const [form, setForm] = useState({
    ...selfDetails,
    address: '',
    city: '',
    state: '',
    project: '',
    leadType: 'Hot',
    date: '',
    time: '',
    notes: '',
  });

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const chooseVisitor = (id) => {
    setRole(id);
    setForm((f) => {
      if (id === 'broker') return { ...f, ...selfDetails };
      // Switching to Client: clear the broker's own details so they aren't submitted by mistake.
      const cleared = {};
      Object.keys(selfDetails).forEach((k) => {
        cleared[k] = f[k] === selfDetails[k] ? '' : f[k];
      });
      return { ...f, ...cleared };
    });
  };

  const create = () => {
    if (!form.name.trim()) {
      Alert.alert('Name required', 'Please enter the visitor name.');
      return;
    }
    addVisit({ ...form, role });
    Alert.alert('Visit created', `${form.name}'s visit has been scheduled.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <Screen
      showBack
      keyboardAction={<PrimaryButton label="Create Visit" iconRight="arrow-right" onPress={create} />}
    >
      <>
        <PageTitle>Schedule Project Visit</PageTitle>

        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
          <Text style={s.group}>Who is visiting?</Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            {VISITOR_OPTIONS.map((opt) => {
              const active = role === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => chooseVisitor(opt.id)}
                  style={[s.roleCard, active && s.roleCardActive]}
                >
                  <Icon name={opt.icon} size={18} color={active ? colors.onSurface : colors.muted} />
                  <Text style={[s.roleLabel, active && { color: colors.onSurface }]} numberOfLines={1} adjustsFontSizeToFit>
                    {opt.label}
                  </Text>
                  <View style={[s.radio, active && { backgroundColor: colors.brandPrimary }]} />
                </Pressable>
              );
            })}
          </View>
          <Text style={s.hint}>{VISITOR_OPTIONS.find((o) => o.id === role).hint}</Text>

          <TextField icon="user" placeholder={role === 'client' ? "Enter client's complete name" : 'Enter complete name'} value={form.name} onChangeText={set('name')} />
          <TextField icon="phone" placeholder="Enter mobile number" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
          <TextField icon="mail" placeholder="Enter email address" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
          <TextField icon="map-pin" placeholder="Enter complete address" value={form.address} onChangeText={set('address')} />

          <StateCityFields
            row
            state={form.state}
            city={form.city}
            onChange={({ state, city }) => setForm((f) => ({ ...f, state, city }))}
          />

          <SelectField
            icon="building"
            placeholder="Select project"
            value={form.project}
            options={[project.name, 'AFFINITY GREEN', 'AFFINITY VILLA', 'AFFINITY PENTHOUSE']}
            onChange={set('project')}
          />

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            {leadTypes.map((t) => {
              const active = form.leadType === t.id;
              const tone = TYPE_TONE[t.id];
              return (
                <Pressable
                  key={t.id}
                  onPress={() => set('leadType')(t.id)}
                  style={[
                    s.typeChip,
                    { backgroundColor: active ? tone.bg : colors.surfaceSecondary },
                    active && { borderColor: tone.fg },
                  ]}
                >
                  <Icon name={t.icon} size={14} color={active ? tone.fg : colors.muted} />
                  <Text style={[s.typeLabel, active && { color: tone.fg }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <DateField placeholder="Select date" value={form.date} onChange={set('date')} style={{ flex: 1 }} />
            <SelectField icon="clock" placeholder="Select time" value={form.time} options={visitTimeSlots} onChange={set('time')} style={{ flex: 1 }} />
          </View>

          <TextField
            icon="file-text"
            placeholder="Enter any special requirements or notes here..."
            value={form.notes}
            onChangeText={set('notes')}
            multiline
          />

          <PrimaryButton label="Create Visit" iconRight="arrow-right" onPress={create} style={{ marginTop: spacing.sm }} />
        </View>
      </>
    </Screen>
  );
}

const s = StyleSheet.create({
  roleCard: {
    flex: 1,
    height: 52,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  roleCardActive: { borderColor: colors.brandPrimary, borderWidth: borderWidth.selected },
  roleLabel: { ...type.body, color: colors.muted, flex: 1 },
  group: { ...type.bodySmall, color: colors.onSurfaceTertiary },
  hint: { ...type.caption, color: colors.muted, marginTop: -spacing.xs },
  radio: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.border },

  typeChip: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  typeLabel: { ...type.bodySmall, color: colors.muted },
});
