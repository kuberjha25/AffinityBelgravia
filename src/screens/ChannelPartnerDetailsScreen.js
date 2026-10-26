import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import KeyboardActionBar, { ACTION_BAR_HEIGHT } from '../components/KeyboardActionBar';
import Icon from '../components/Icon';
import { useRegistrationSubmit } from '../components/RegistrationSubmit';
import { WizardHeader, TextField, SelectField, PrimaryButton, LoadingState, ErrorState } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { businessTypes } from '../data';
import { patchOnboarding, setDocument } from '../store/slices/onboardingSlice';
import { useLookup } from '../hooks';

const MAX_BYTES = 5 * 1024 * 1024;
const FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/**
 * Figma frame: `channel-partner-details` (12:292) — wizard step 3, channel partners only.
 * The document list and which ones are mandatory come from GET /cp-documents (#7).
 */
export default function ChannelPartnerDetailsScreen({ navigation }) {
  const dispatch = useDispatch();
  const onboarding = useSelector((state) => state.onboarding);
  const cpDocuments = useLookup('cpDocuments');
  const [business, setBusiness] = useState(onboarding.business);
  const { submit, submitting, dialog } = useRegistrationSubmit(navigation);

  const set = (key) => (value) => setBusiness((b) => ({ ...b, [key]: value }));
  const upper = (key) => (value) => set(key)(value.toUpperCase());

  const choose = async (doc) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: FILE_TYPES, copyToCacheDirectory: true });
      const asset = res.canceled ? null : res.assets?.[0];
      if (!asset) return;
      if (asset.size && asset.size > MAX_BYTES) {
        Alert.alert('File too large', 'Each document must be 5 MB or smaller.');
        return;
      }
      dispatch(
        setDocument({
          key: doc.field_key,
          file: { uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/octet-stream', file: asset.file },
        })
      );
    } catch {
      Alert.alert('Upload failed', 'Could not open the file picker. Please try again.');
    }
  };

  const pickDocument = (doc) => {
    const current = onboarding.documents[doc.field_key];
    if (!current) {
      choose(doc);
      return;
    }
    Alert.alert(doc.name, current.name, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => dispatch(setDocument({ key: doc.field_key, file: null })) },
      { text: 'Replace', onPress: () => choose(doc) },
    ]);
  };

  const onSubmit = () => {
    if (!business.companyName.trim()) {
      Alert.alert('Company name', 'Please enter the registered business name.');
      return;
    }
    if (!business.businessType) {
      Alert.alert('Business type', 'Please select the business type.');
      return;
    }
    const missing = (cpDocuments.items || []).filter((d) => d.is_mandatory && !onboarding.documents[d.field_key]);
    if (missing.length) {
      Alert.alert('Required documents', `Please upload: ${missing.map((d) => d.name).join(', ')}`);
      return;
    }
    dispatch(patchOnboarding({ business }));
    submit();
  };

  const businessLabel = businessTypes.find((b) => b.value === business.businessType)?.label || '';

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
          title={onboarding.mode === 'admin' ? 'Register Partner' : 'Complete Profile'}
          subtitle="Please provide your company details and upload required documents."
          onBack={() => navigation.goBack()}
        />

        <View style={s.body}>
          <Text style={s.groupLabel}>Company Details</Text>
          <View style={{ gap: spacing.md }}>
            <TextField icon="building" label="Company / Entity Name" placeholder="Enter registered business name" value={business.companyName} onChangeText={set('companyName')} />
            <SelectField
              icon="briefcase"
              label="Business Type"
              placeholder="Select business type"
              value={businessLabel}
              options={businessTypes}
              onChange={set('businessType')}
            />
            <TextField icon="file-text" label="GST Number" placeholder="Enter GSTIN" value={business.gstNumber} onChangeText={upper('gstNumber')} autoCapitalize="characters" maxLength={15} />
            <TextField icon="file-text" label="PAN Number" placeholder="Enter PAN" value={business.panNumber} onChangeText={upper('panNumber')} autoCapitalize="characters" maxLength={10} />
            <TextField icon="file-text" label="RERA Registration Number" placeholder="Enter RERA registration number" value={business.reraNumber} onChangeText={upper('reraNumber')} autoCapitalize="characters" />
            <TextField icon="file-text" label="MSME / Udyam Number" placeholder="Optional" value={business.msmeNumber} onChangeText={upper('msmeNumber')} autoCapitalize="characters" />
          </View>

          <Text style={[s.groupLabel, { marginTop: spacing.xl }]}>Upload Documents</Text>
          <Text style={s.hint}>JPG, PNG or PDF, up to 5 MB each.</Text>

          {cpDocuments.status === 'loading' || cpDocuments.status === 'idle' ? <LoadingState /> : null}
          {cpDocuments.status === 'failed' ? <ErrorState message={cpDocuments.error} onRetry={cpDocuments.reload} /> : null}
          {cpDocuments.status === 'succeeded' && cpDocuments.items.length === 0 ? (
            <Text style={s.hint}>No documents are required at the moment.</Text>
          ) : null}

          <View style={{ gap: spacing.md }}>
            {(cpDocuments.items || []).map((doc) => {
              const file = onboarding.documents[doc.field_key];
              return (
                <View key={doc.field_key} style={s.docRow}>
                  <View style={s.docIcon}>
                    <Icon name="file-text" size={18} color={colors.brandPrimary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.docTitle}>{doc.name}</Text>
                    {file ? <Text style={s.docHint} numberOfLines={1}>{file.name}</Text> : null}
                    <Text style={[s.docTag, doc.is_mandatory && { color: colors.error }]}>
                      {doc.is_mandatory ? 'Required' : 'Optional'}
                    </Text>
                  </View>
                  <Pressable onPress={() => pickDocument(doc)} style={[s.uploadBtn, file && s.uploadBtnDone]}>
                    <Icon
                      name={file ? 'check' : 'upload'}
                      size={13}
                      color={file ? colors.onBrand : colors.brandPrimary}
                      strokeWidth={file ? 2 : undefined}
                    />
                    <Text style={[s.uploadLabel, file && { color: colors.onBrand }]}>{file ? 'Added' : 'Upload'}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <PrimaryButton label="Submit Application" onPress={onSubmit} loading={submitting} style={{ marginTop: spacing.xl }} />
        </View>
      </KeyboardAwareScrollView>
      <KeyboardActionBar>
        <PrimaryButton label="Submit Application" onPress={onSubmit} loading={submitting} />
      </KeyboardActionBar>
      {dialog}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { paddingBottom: spacing.xxxl },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },

  groupLabel: { ...type.bodySmall, color: colors.muted, marginBottom: spacing.md },
  hint: { ...type.caption, color: colors.muted, marginTop: -spacing.sm, marginBottom: spacing.md },

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
