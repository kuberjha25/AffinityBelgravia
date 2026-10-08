import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import KeyboardActionBar, { ACTION_BAR_HEIGHT } from '../components/KeyboardActionBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { WizardHeader, TextField, PrimaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { useApp } from '../store';

/** Figma frame: `channel-partner-details` (12:292) — wizard step 3. */
export default function ChannelPartnerDetailsScreen({ navigation }) {
  const { onboarding, completeOnboarding, setDocumentFile } = useApp();
  const [company, setCompany] = useState(onboarding.company);
  const [reraNumber, setReraNumber] = useState(onboarding.reraNumber);

  // #7: the document list and which ones are mandatory come from Admin config.
  const pickDocument = async (doc) => {
    if (doc.uploaded) {
      Alert.alert(doc.title, doc.fileName, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => setDocumentFile(doc.id, '') },
        { text: 'Replace', onPress: () => choose(doc) },
      ]);
      return;
    }
    choose(doc);
  };

  const choose = async (doc) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets?.[0]) setDocumentFile(doc.id, res.assets[0].name);
    } catch {
      Alert.alert('Upload failed', 'Could not open the file picker. Please try again.');
    }
  };

  const submit = () => {
    const missing = onboarding.documents.filter((d) => d.mandatory && !d.uploaded);
    if (missing.length) {
      Alert.alert(
        'Required documents',
        `Please upload: ${missing.map((d) => d.title).join(', ')}`
      );
      return;
    }
    completeOnboarding({ company, reraNumber });
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

            <Text style={[s.fieldLabel, { marginTop: spacing.lg }]}>RERA Registration Number</Text>
            <TextField
              icon="file-text"
              placeholder="Enter RERA registration number"
              value={reraNumber}
              onChangeText={(v) => setReraNumber(v.toUpperCase())}
              autoCapitalize="characters"
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
                    <Text style={s.docHint} numberOfLines={1}>{doc.uploaded ? doc.fileName : doc.hint}</Text>
                    <Text style={[s.docTag, doc.mandatory && { color: colors.error }]}>
                      {doc.mandatory ? 'Required' : 'Optional'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => pickDocument(doc)}
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
  docTag: { ...type.caption, fontSize: 11, color: colors.muted, marginTop: 2 },

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
