import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import KeyboardActionBar, { ACTION_BAR_HEIGHT } from '../components/KeyboardActionBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { WizardHeader, TextField, PrimaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { useApp } from '../store';

/** Figma frame: `channel-partner-details` (12:292) — wizard step 3. */
export default function ChannelPartnerDetailsScreen({ navigation }) {
  const { onboarding, completeOnboarding, toggleDocument } = useApp();
  const [company, setCompany] = useState(onboarding.company);

  const submit = () => {
    completeOnboarding({ company });
    navigation.navigate('ThankYou');
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
            step={3}
            total={3}
            title="Complete Profile"
            subtitle="Please provide your company details and upload required documents."
            onBack={() => navigation.goBack()}
          />

          <View style={s.body}>
            <Text style={s.groupLabel}>Company Details</Text>
            <Text style={s.fieldLabel}>Company / Entity Name</Text>
            <TextField
              icon="building"
              placeholder="Enter registered business name"
              value={company}
              onChangeText={setCompany}
            />

            <Text style={[s.groupLabel, { marginTop: spacing.xl }]}>Upload Documents</Text>

            <View style={{ gap: spacing.md }}>
              {onboarding.documents.map((doc) => (
                <View key={doc.id} style={s.docRow}>
                  <View style={s.docIcon}>
                    <Icon name="file-text" size={18} color={colors.brandPrimary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.docTitle}>{doc.title}</Text>
                    <Text style={s.docHint}>{doc.hint}</Text>
                  </View>
                  <Pressable
                    onPress={() => toggleDocument(doc.id)}
                    style={[s.uploadBtn, doc.uploaded && s.uploadBtnDone]}
                  >
                    <Icon
                      name={doc.uploaded ? 'check' : 'upload'}
                      size={13}
                      color={doc.uploaded ? colors.onBrand : colors.brandPrimary}
                      strokeWidth={doc.uploaded ? 2 : undefined}
                    />
                    <Text style={[s.uploadLabel, doc.uploaded && { color: colors.onBrand }]}>
                      {doc.uploaded ? 'Added' : 'Upload'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <PrimaryButton label="Submit Application" onPress={submit} style={{ marginTop: spacing.xl }} />
          </View>
      </KeyboardAwareScrollView>
      <KeyboardActionBar>
        <PrimaryButton label="Submit Application" onPress={submit} />
      </KeyboardActionBar>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { paddingBottom: spacing.xxxl },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },

  groupLabel: { ...type.bodySmall, color: colors.muted, marginBottom: spacing.md },
  fieldLabel: { ...type.bodySmall, color: colors.onSurfaceTertiary, marginBottom: spacing.sm },

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    padding: spacing.md,
  },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.glassTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: { ...type.bodySmall, color: colors.onSurface },
  docHint: { ...type.caption, color: colors.muted, marginTop: 2 },

  uploadBtn: {
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: borderWidth.default,
    borderColor: colors.brandPrimary,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadBtnDone: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
    borderStyle: 'solid',
  },
  uploadLabel: { ...type.caption, color: colors.brandPrimary },
});
