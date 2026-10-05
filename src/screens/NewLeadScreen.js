import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import DateField from '../components/DateField';
import { TextField, SelectField, StateCityFields, PrimaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { leadCategories, leadInterestOptions, leadTypes, visitTimeSlots } from '../data';

const INTEREST_ICONS = {
  Project: 'building',
  Configuration: 'layers',
  'Budget Range': 'hash',
  'Preferred Floor': 'building-2',
  Possession: 'calendar',
  Financing: 'briefcase',
};
import { useApp } from '../store';

const TYPE_TONE = {
  Hot: { fg: colors.error, bg: 'rgba(180,83,74,0.06)' },
  Warm: { fg: colors.error, bg: 'rgba(180,83,74,0.06)' },
  Cold: { fg: colors.muted, bg: colors.surfaceSecondary },
};

/** Figma frame: `lead-detail-screen` @ 9651 (12:2293) — the New Lead form. */
export default function NewLeadScreen({ navigation }) {
  const { addLead } = useApp();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    address: '',
    city: '',
    state: '',
    type: 'Warm',
    visitDate: '',
    visitTime: '',
    remarks: '',
    interest: {},
  });

  const setInterest = (key) => (value) =>
    setForm((f) => ({ ...f, interest: { ...f.interest, [key]: value } }));

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.name.trim()) {
      Alert.alert('Name required', 'Please enter the lead name.');
      return;
    }
    const record = addLead(form);
    Alert.alert('Lead submitted', `${record.name} has been added to your leads.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <Screen showBack keyboardAction={<PrimaryButton label="Submit Lead" onPress={submit} />}>
      <>
        <PageTitle>New Lead</PageTitle>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <Text style={s.group}>Details</Text>
          <View style={{ gap: spacing.md }}>
            <TextField icon="user" placeholder="Full Name" value={form.name} onChangeText={set('name')} />
            <TextField icon="mail" placeholder="Email Address" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
            <TextField icon="phone" placeholder="Mobile Number" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
            <SelectField icon="grid" placeholder="Category" value={form.category} options={leadCategories} onChange={set('category')} />
          </View>

          <Text style={s.group}>Address</Text>
          <View style={{ gap: spacing.md }}>
            <TextField icon="map-pin" placeholder="Address" value={form.address} onChangeText={set('address')} />
            <StateCityFields
              row
              state={form.state}
              city={form.city}
              onChange={({ state, city }) => setForm((f) => ({ ...f, state, city }))}
            />
          </View>

          <Text style={s.group}>Interest Details (optional)</Text>
          <View style={{ gap: spacing.md }}>
            {Object.entries(leadInterestOptions).map(([key, options]) => (
              <SelectField
                key={key}
                icon={INTEREST_ICONS[key]}
                placeholder={key}
                value={form.interest[key]}
                options={options}
                onChange={setInterest(key)}
              />
            ))}
          </View>

          <Text style={s.group}>Lead Type</Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            {leadTypes.map((t) => {
              const active = form.type === t.id;
              const tone = TYPE_TONE[t.id];
              return (
                <Pressable
                  key={t.id}
                  onPress={() => set('type')(t.id)}
                  style={[s.typeChip, { backgroundColor: active ? tone.bg : colors.surfaceSecondary }, active && { borderColor: tone.fg }]}
                >
                  <Icon name={t.icon} size={16} color={active ? tone.fg : colors.muted} />
                  <Text style={[s.typeLabel, active && { color: tone.fg }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={s.group}>Schedule</Text>
          <View style={{ gap: spacing.md }}>
            <DateField placeholder="Visit Date" value={form.visitDate} onChange={set('visitDate')} />
            <SelectField icon="clock" placeholder="Visit Time (2 hrs slots)" value={form.visitTime} options={visitTimeSlots} onChange={set('visitTime')} />
          </View>

          <Text style={s.group}>Remarks</Text>
          <TextField
            icon="edit"
            placeholder="Enter remarks (optional)"
            value={form.remarks}
            onChangeText={set('remarks')}
            multiline
            maxLength={500}
            showCounter
          />

          <PrimaryButton label="Submit Lead" onPress={submit} style={{ marginTop: spacing.lg }} />
        </View>
      </>
    </Screen>
  );
}

const s = StyleSheet.create({
  group: { ...type.bodySmall, color: colors.muted, marginTop: spacing.xl, marginBottom: spacing.md },
  typeChip: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  typeLabel: { ...type.body, color: colors.muted },
});
