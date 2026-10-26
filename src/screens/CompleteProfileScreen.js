import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import KeyboardActionBar, { ACTION_BAR_HEIGHT } from '../components/KeyboardActionBar';
import Icon from '../components/Icon';
import DateField from '../components/DateField';
import { WizardHeader, TextField, StateCityFields, PrimaryButton, Eyebrow } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { partnerTypes, states } from '../data';
import { digits } from '../format';
import { lookupPincode } from '../api';
import { patchOnboarding } from '../store/slices/onboardingSlice';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Figma frame: `complete-profile` (12:126) — wizard step 1. */
export default function CompleteProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const onboarding = useSelector((state) => state.onboarding);
  const isAdmin = onboarding.mode === 'admin';
  const [partnerType, setPartnerType] = useState(onboarding.partnerType);
  const [form, setForm] = useState(onboarding.basic);
  const total = partnerType === 'channel_partner' ? 3 : 2;

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  // PIN code → city / state (India Post).
  useEffect(() => {
    if ((form.pincode || '').length !== 6) return undefined;
    let cancelled = false;
    lookupPincode(form.pincode).then((place) => {
      if (cancelled || !place) return;
      const state = states.find((st) => st.toLowerCase() === place.state.toLowerCase()) || place.state;
      setForm((f) => ({ ...f, state, city: place.city || f.city }));
    });
    return () => {
      cancelled = true;
    };
  }, [form.pincode]);

  const onContinue = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      Alert.alert('Name required', 'Please enter first and last name.');
      return;
    }
    if ((form.mobile || '').length !== 10) {
      Alert.alert('Mobile number', 'Please enter a 10-digit mobile number.');
      return;
    }
    if (form.email && !EMAIL.test(form.email.trim())) {
      Alert.alert('Email address', 'Please enter a valid email address.');
      return;
    }
    dispatch(patchOnboarding({ partnerType, basic: form }));
    navigation.navigate('ProfileStepTwo');
  };

  return (
    <SafeAreaView edges={['top']} style={s.root}>
      <KeyboardAwareScrollView
        bottomOffset={ACTION_BAR_HEIGHT}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <WizardHeader
          step={1}
          total={total}
          title={isAdmin ? 'Register Partner' : 'Complete Profile'}
          subtitle={isAdmin ? 'Enter the partner’s details' : 'Please fill in your details to get started'}
          onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        />

        <View style={s.body}>
          <Eyebrow style={{ marginTop: spacing.xl }}>{isAdmin ? 'PARTNER TYPE' : 'I AM A'}</Eyebrow>

          <View style={s.roleGrid}>
            {partnerTypes.map((opt) => {
              const active = partnerType === opt.id;
              return (
                <Pressable key={opt.id} onPress={() => setPartnerType(opt.id)} style={[s.roleCard, active && s.roleCardActive]}>
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
            <TextField icon="user" placeholder="First Name" value={form.firstName} onChangeText={set('firstName')} maxLength={100} />
            <TextField icon="user" placeholder="Last Name" value={form.lastName} onChangeText={set('lastName')} maxLength={100} />
            <TextField icon="mail" placeholder="Email Address" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
            <TextField
              icon="phone"
              placeholder="Mobile Number"
              value={form.mobile}
              onChangeText={(v) => set('mobile')(digits(v, 10))}
              keyboardType="number-pad"
              maxLength={10}
              disabled={!isAdmin && Boolean(onboarding.mobile)}
            />
            <TextField icon="map-pin" placeholder="Address" value={form.address} onChangeText={set('address')} />
            <TextField
              icon="hash"
              placeholder="PIN Code"
              value={form.pincode}
              onChangeText={(v) => set('pincode')(digits(v, 6))}
              keyboardType="number-pad"
              maxLength={6}
            />
            <StateCityFields
              state={form.state}
              city={form.city}
              onChange={({ state, city }) => setForm((f) => ({ ...f, state, city }))}
            />
            <DateField placeholder="Date of Birth" value={form.dob} onChange={set('dob')} />
            <DateField placeholder="Date of Anniversary" value={form.anniversary} onChange={set('anniversary')} />
          </View>

          <PrimaryButton label="Continue" iconRight="arrow-right" onPress={onContinue} style={{ marginTop: spacing.xl }} />
        </View>
      </KeyboardAwareScrollView>
      <KeyboardActionBar>
        <PrimaryButton label="Continue" iconRight="arrow-right" onPress={onContinue} />
      </KeyboardActionBar>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { paddingBottom: spacing.xxxl },
  body: { paddingHorizontal: spacing.xl },

  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  roleCard: {
    width: '47%',
    flexGrow: 1,
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
