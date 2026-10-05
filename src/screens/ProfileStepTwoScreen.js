import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import KeyboardActionBar, { ACTION_BAR_HEIGHT } from '../components/KeyboardActionBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { WizardHeader, TextField, SelectField, PrimaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { employees } from '../data';
import { useApp } from '../store';

/** Figma frame: `profile-step-two-new` (12:223) — wizard step 2. */
export default function ProfileStepTwoScreen({ navigation }) {
  const { onboarding, patchOnboarding } = useApp();
  const [knows, setKnows] = useState(onboarding.knowsEmployee);
  const [employee, setEmployee] = useState(onboarding.employee);
  const [social, setSocial] = useState(onboarding.social);

  const showSocial = onboarding.role !== 'partner';

  const setSocialField = (key) => (value) => setSocial((sv) => ({ ...sv, [key]: value }));

  const onContinue = () => {
    patchOnboarding({
      knowsEmployee: knows,
      employee: knows === 'yes' ? employee : '',
      social: showSocial ? social : { facebook: '', instagram: '', youtube: '' },
    });
    navigation.navigate('ChannelPartnerDetails');
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
            step={2}
            total={3}
            title="Complete Profile"
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
                  <Pressable
                    key={opt.id}
                    onPress={() => setKnows(opt.id)}
                    style={[s.toggle, active && s.toggleActive]}
                  >
                    <Icon
                      name={opt.icon}
                      size={14}
                      color={active ? colors.onSurfaceInverse : colors.muted}
                      strokeWidth={2}
                    />
                    <Text style={[s.toggleLabel, active && s.toggleLabelActive]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {knows === 'yes' ? (
              <>
                <Text style={[s.label, { marginTop: spacing.xl }]}>Select Employee</Text>
                <SelectField
                  icon="user"
                  placeholder="Select associated employee"
                  value={employee}
                  options={employees}
                  onChange={setEmployee}
                />
              </>
            ) : null}

            {/* Partners register as businesses, so social profiles are only asked of influencers / freelancers. */}
            {showSocial ? (
            <>
            <Text style={[s.label, { marginTop: spacing.xl }]}>Social Media Profiles</Text>
            <View style={{ gap: spacing.md }}>
              <TextField
                icon="facebook"
                placeholder="Facebook Profile Link"
                value={social.facebook}
                onChangeText={setSocialField('facebook')}
                autoCapitalize="none"
              />
              <TextField
                icon="instagram"
                placeholder="Instagram Profile Link"
                value={social.instagram}
                onChangeText={setSocialField('instagram')}
                autoCapitalize="none"
              />
              <TextField
                icon="youtube"
                placeholder="YouTube Channel Link"
                value={social.youtube}
                onChangeText={setSocialField('youtube')}
                autoCapitalize="none"
              />
            </View>
            </>
            ) : null}

            <PrimaryButton label="Continue" iconRight="arrow-right" onPress={onContinue} style={{ marginTop: spacing.xxl }} />
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
