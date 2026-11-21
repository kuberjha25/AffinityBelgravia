import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import KeyboardActionBar, { ACTION_BAR_HEIGHT } from '../components/KeyboardActionBar';
import Icon from '../components/Icon';
import ReferencePicker from '../components/ReferencePicker';
import { useRegistrationSubmit } from '../components/RegistrationSubmit';
import { WizardHeader, TextField, PrimaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { patchOnboarding } from '../store/slices/onboardingSlice';

/** Adds https:// to a bare "instagram.com/name" so the backend's URL check passes. */
const withScheme = (url) => {
  const v = (url || '').trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

/**
 * Figma frame: `profile-step-two-new` (12:223) — wizard step 2.
 * Channel partners continue to step 3; everyone else submits here.
 */
export default function ProfileStepTwoScreen({ navigation }) {
  const dispatch = useDispatch();
  const onboarding = useSelector((state) => state.onboarding);
  const [knows, setKnows] = useState(onboarding.knowsEmployee);
  const [employee, setEmployee] = useState(onboarding.employee);
  const [social, setSocial] = useState(onboarding.social);
  const { submit, submitting, dialog } = useRegistrationSubmit(navigation);

  const isChannelPartner = onboarding.partnerType === 'channel_partner';
  const showSocial = onboarding.partnerType === 'influencer';
  const total = isChannelPartner ? 4 : 2;
  // Self-registration has no session: the employee list is loaded without a token.
  const isSelf = onboarding.mode === 'self';

  const setSocialField = (key) => (value) => setSocial((sv) => ({ ...sv, [key]: value }));

  const onContinue = () => {
    if (knows === 'yes' && !employee) {
      Alert.alert('Select employee', 'Please select the employee you know, or choose No.');
      return;
    }
    dispatch(
      patchOnboarding({
        knowsEmployee: knows,
        employee: knows === 'yes' ? employee : null,
        social: showSocial
          ? {
              facebook: withScheme(social.facebook),
              instagram: withScheme(social.instagram),
              youtube: withScheme(social.youtube),
            }
          : { facebook: '', instagram: '', youtube: '' },
      })
    );
    if (isChannelPartner) navigation.navigate('ChannelPartnerDetails');
    else submit();
  };

  const actionLabel = isChannelPartner ? 'Continue' : 'Submit Application';

  return (
    <SafeAreaView edges={['top']} style={s.root}>
      <KeyboardAwareScrollView
        bottomOffset={ACTION_BAR_HEIGHT}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <WizardHeader
          step={2}
          total={total}
          title={onboarding.mode === 'admin' ? 'Register Partner' : 'Complete Profile'}
          subtitle="Please fill in your details to get started"
          onBack={() => navigation.goBack()}
        />

        <View style={s.body}>
          <Text style={s.label}>Do you know any employee?</Text>
          <View style={s.toggleRow}>
            {[
              { id: 'yes', label: 'Yes', icon: 'check' },
              { id: 'no', label: 'No', icon: 'x' },
            ].map((opt) => {
              const active = knows === opt.id;
              return (
                <Pressable key={opt.id} onPress={() => setKnows(opt.id)} style={[s.toggle, active && s.toggleActive]}>
                  <Icon name={opt.icon} size={14} color={active ? colors.onSurfaceInverse : colors.muted} strokeWidth={2} />
                  <Text style={[s.toggleLabel, active && s.toggleLabelActive]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {knows === 'yes' ? (
            <>
              <Text style={[s.label, { marginTop: spacing.xl }]}>Select Employee</Text>
              <ReferencePicker
                pickerKey="employee"
                userType="backoffice"
                isPublic={isSelf}
                placeholder="Select associated employee"
                sheetTitle="Select Employee"
                value={employee}
                onChange={setEmployee}
              />
            </>
          ) : null}

          {/* Social profiles are only collected for influencers. */}
          {showSocial ? (
            <>
              <Text style={[s.label, { marginTop: spacing.xl }]}>Social Media Profiles</Text>
              <View style={{ gap: spacing.md }}>
                <TextField icon="facebook" placeholder="Facebook Profile Link" value={social.facebook} onChangeText={setSocialField('facebook')} autoCapitalize="none" keyboardType="url" />
                <TextField icon="instagram" placeholder="Instagram Profile Link" value={social.instagram} onChangeText={setSocialField('instagram')} autoCapitalize="none" keyboardType="url" />
                <TextField icon="youtube" placeholder="YouTube Channel Link" value={social.youtube} onChangeText={setSocialField('youtube')} autoCapitalize="none" keyboardType="url" />
              </View>
            </>
          ) : null}

          <PrimaryButton
            label={actionLabel}
            iconRight={isChannelPartner ? 'arrow-right' : undefined}
            onPress={onContinue}
            loading={submitting}
            style={{ marginTop: spacing.xxl }}
          />
        </View>
      </KeyboardAwareScrollView>
      <KeyboardActionBar>
        <PrimaryButton label={actionLabel} iconRight={isChannelPartner ? 'arrow-right' : undefined} onPress={onContinue} loading={submitting} />
      </KeyboardActionBar>
      {dialog}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { paddingBottom: spacing.xxxl },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },

  label: { ...type.bodySmall, color: colors.onSurfaceTertiary, marginBottom: spacing.md },

  toggleRow: { flexDirection: 'row', gap: spacing.md },
  toggle: {
    flex: 1,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
  },
  // Only the chosen answer is dark; the other stays light so the choice is obvious.
  toggleActive: {
    backgroundColor: colors.surfaceInverse,
    borderWidth: borderWidth.selected,
    borderColor: colors.brandPrimary,
  },
  toggleLabel: { ...type.body, color: colors.onSurfaceTertiary },
  toggleLabelActive: { color: colors.onSurfaceInverse },
});
