import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import DateField from '../components/DateField';
import { TextField, SelectField, PrimaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { leadTypes, project, states, visitTimeSlots } from '../data';
import { useApp } from '../store';

const TYPE_TONE = {
  Hot: { fg: colors.error, bg: 'rgba(180,83,74,0.10)' },
  Warm: { fg: colors.error, bg: 'rgba(180,83,74,0.10)' },
  Cold: { fg: colors.success, bg: colors.surfaceSecondary },
};

/** Figma frame: `schedule-visit-screen` (12:1176). */
export default function ScheduleVisitScreen({ navigation }) {
  const { addVisit } = useApp();
  const [role, setRole] = useState('broker');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
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
    <Screen showBack>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <PageTitle>Schedule Project Visit</PageTitle>

        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            {[
              { id: 'broker', label: 'Broker', icon: 'user' },
              { id: 'client', label: 'Client', icon: 'user' },
            ].map((opt) => {
              const active = role === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setRole(opt.id)}
                  style={[s.roleCard, active && s.roleCardActive]}
                >
                  <Icon name={opt.icon} size={18} color={active ? colors.onSurface : colors.muted} />
                  <Text style={[s.roleLabel, active && { color: colors.onSurface }]}>{opt.label}</Text>
                  <View style={[s.radio, active && { backgroundColor: colors.brandPrimary }]} />
                </Pressable>
              );
            })}
          </View>

          <TextField icon="user" placeholder="Enter complete name" value={form.name} onChangeText={set('name')} />
          <TextField icon="phone" placeholder="Enter mobile number" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
          <TextField icon="mail" placeholder="Enter email address" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
          <TextField icon="map-pin" placeholder="Enter complete address" value={form.address} onChangeText={set('address')} />

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TextField icon="building" placeholder="Enter city" value={form.city} onChangeText={set('city')} style={{ flex: 1 }} />
            <SelectField icon="map" placeholder="Select state" value={form.state} options={states} onChange={set('state')} style={{ flex: 1 }} />
          </View>

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
      </KeyboardAvoidingView>
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
