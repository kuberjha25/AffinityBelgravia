import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import DateField from '../components/DateField';
import { TextField, SelectField, StateCityFields, PrimaryButton } from '../components/ui';
import LeadSourceFields, { validateLeadSource } from '../components/LeadSourceFields';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { leadTypes, project } from '../data';
import { timeSlots } from '../config';
import { useApp } from '../store';

const TYPE_TONE = {
  Hot: { fg: colors.error, bg: 'rgba(180,83,74,0.10)' },
  Warm: { fg: colors.error, bg: 'rgba(180,83,74,0.10)' },
  Cold: { fg: colors.success, bg: colors.surfaceSecondary },
};

const PROJECTS = [project.name, 'AFFINITY GREEN', 'AFFINITY VILLA', 'AFFINITY PENTHOUSE'];

/**
 * Figma frame: `schedule-visit-screen` (12:1176).
 * Staff only (#3): a visit is booked by Sales / Front Office staff, on behalf
 * of the CP / Freelancer / Influencer when they bring the customer in.
 * Opened from a lead (`route.params.leadId`) the customer's details are pre-filled.
 */
export default function ScheduleVisitScreen({ navigation, route }) {
  const { addVisit, allLeads } = useApp();
  const lead = route?.params?.leadId ? allLeads.find((l) => l.id === route.params.leadId) : null;
  const [form, setForm] = useState(() => ({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    source: lead?.source || '',
    associateId: lead?.associateId || null,
    mobileLast4: lead?.mobileLast4 || '',
    aadhaarLast4: lead?.aadhaarLast4 || '',
    address: lead?.address || '',
    city: lead?.city || '',
    state: lead?.state || '',
    project: '',
    leadType: lead?.type || 'Hot',
    date: '',
    time: '',
    notes: '',
  }));

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const patch = (p) => setForm((f) => ({ ...f, ...p }));

  const create = () => {
    if (!form.name.trim()) {
      Alert.alert('Name required', 'Please enter the visitor name.');
      return;
    }
    const error = validateLeadSource(form);
    if (error) {
      Alert.alert('Check details', error);
      return;
    }
    addVisit(form);
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
          <TextField icon="user" placeholder="Enter customer's complete name" value={form.name} onChangeText={set('name')} />
          <LeadSourceFields form={form} onChange={patch} />
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
            options={PROJECTS}
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
            <SelectField icon="clock" placeholder="Time slot" sheetTitle="Time Slot" value={form.time} options={timeSlots} onChange={set('time')} style={{ flex: 1 }} />
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
