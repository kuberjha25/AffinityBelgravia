import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import DateField from '../components/DateField';
import { WizardHeader, TextField, SelectField, PrimaryButton, Eyebrow } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { roleOptions, states } from '../data';
import { useApp } from '../store';

/** Figma frame: `complete-profile` (12:126) — wizard step 1. */
export default function CompleteProfileScreen({ navigation }) {
  const { onboarding, patchOnboarding } = useApp();
  const [role, setRole] = useState(onboarding.role);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: onboarding.mobile,
    address: '',
    city: '',
    state: '',
    pin: '',
    dob: '',
    anniversary: '',
    ...onboarding.basic,
  });

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const onContinue = () => {
    patchOnboarding({ role, basic: form });
    navigation.navigate('ProfileStepTwo');
  };

  return (
    <SafeAreaView edges={['top']} style={s.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <WizardHeader
            step={1}
            total={3}
            title="Complete Profile"
            subtitle="Please fill in your details to get started"
          />

          <View style={s.body}>
            <Eyebrow style={{ marginTop: spacing.xl }}>I AM A</Eyebrow>

            <View style={s.roleRow}>
              {roleOptions.map((opt) => {
                const active = role === opt.id;
                return (
                  <Pressable key={opt.id} onPress={() => setRole(opt.id)} style={[s.roleCard, active && s.roleCardActive]}>
                    <Icon name={opt.icon} size={20} color={active ? colors.brandPrimary : colors.onSurfaceTertiary} />
                    <Text style={[s.roleLabel, active && { color: colors.onSurface }]}>{opt.label}</Text>
                    {active ? (
                      <View style={s.roleCheck}>
                        <Icon name="check" size={10} color={colors.onBrand} strokeWidth={2} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <Text style={s.sectionHeading}>Basic Information</Text>

            <View style={{ gap: spacing.md }}>
              <TextField icon="user" placeholder="First Name" value={form.firstName} onChangeText={set('firstName')} />
              <TextField icon="user" placeholder="Last Name" value={form.lastName} onChangeText={set('lastName')} />
              <TextField icon="mail" placeholder="Email Address" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
              <TextField icon="phone" placeholder="Mobile Number" value={form.mobile} onChangeText={set('mobile')} keyboardType="phone-pad" />
              <TextField icon="map-pin" placeholder="Address" value={form.address} onChangeText={set('address')} />
              <TextField icon="building" placeholder="City" value={form.city} onChangeText={set('city')} />
              <SelectField icon="building" placeholder="State" value={form.state} options={states} onChange={set('state')} />
              <TextField icon="hash" placeholder="PIN Code" value={form.pin} onChangeText={set('pin')} keyboardType="number-pad" maxLength={6} />
              <DateField placeholder="Date of Birth" value={form.dob} onChange={set('dob')} />
              <DateField placeholder="Date of Anniversary" value={form.anniversary} onChange={set('anniversary')} />
            </View>

            <PrimaryButton label="Continue" iconRight="arrow-right" onPress={onContinue} style={{ marginTop: spacing.xl }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { paddingBottom: spacing.xxxl },
  body: { paddingHorizontal: spacing.xl },

  roleRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  roleCard: {
    flex: 1,
    height: 78,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  roleCardActive: {
    borderColor: colors.brandPrimary,
    borderWidth: borderWidth.selected,
    backgroundColor: colors.glassTint,
  },
  roleLabel: { ...type.bodySmall, color: colors.onSurfaceTertiary },
  roleCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },

  sectionHeading: { ...type.heading, color: colors.onSurface, marginTop: spacing.xl, marginBottom: spacing.lg },
});
