import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon from '../components/Icon';
import { useRegistrationSubmit } from '../components/RegistrationSubmit';
import { WizardHeader, PrimaryButton, LoadingState, ErrorState } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { setDocument, setRequiredDocs } from '../store/slices/onboardingSlice';
import { useKeyedLookup } from '../hooks';
import { readRegistrationErrors, screenForField } from '../registrationErrors';

const MAX_BYTES = 5 * 1024 * 1024;
const FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/**
 * Wizard step 4 of 4 (channel partners): every document set up for the chosen
 * business type, all optional, then "Submit Application". GET /cp-documents
 * doesn't reliably say what's mandatory, so documents are marked Required only
 * when the registration API rejects the application for missing them; those
 * must be uploaded before submitting again.
 */
export default function UploadDocumentsScreen({ navigation }) {
  const dispatch = useDispatch();
  const onboarding = useSelector((state) => state.onboarding);
  const allCpDocuments = useSelector((state) => state.lookups.cpDocuments);
  const businessType = onboarding.business.businessType;
  const cpDocuments = useKeyedLookup('cpDocuments', businessType);
  const required = onboarding.requiredDocs || {};
  const files = onboarding.documents;

  // The type's documents, plus any the API asked for that aren't in that list.
  const listed = cpDocuments.items || [];
  const extra = Object.entries(required)
    .filter(([key]) => !listed.some((d) => d.field_key === key))
    .map(([key, r]) => ({ field_key: key, name: r.name }));
  const docs = [...listed, ...extra];

  const onError = (message, fieldErrors) => {
    // Names for documents from any business type, in case the API asks for one outside this list.
    const known = [...docs];
    Object.values(allCpDocuments).forEach((entry) =>
      (entry?.items || []).forEach((d) => {
        if (!known.some((k) => k.field_key === d.field_key)) known.push(d);
      })
    );
    const { docs: missingDocs, others } = readRegistrationErrors(message, fieldErrors, known);

    if (Object.keys(missingDocs).length) {
      dispatch(setRequiredDocs(missingDocs));
      const names = Object.values(missingDocs).map((d) => `• ${d.name}`).join('\n');
      const rest = others.length ? `\n\n${others.map((o) => o.message).join('\n')}` : '';
      Alert.alert('Documents required', `Please upload the following and submit again:\n${names}${rest}`);
      return true;
    }

    if (others.length) {
      const screen = screenForField(others[0].key);
      const text = others.map((o) => o.message).join('\n');
      Alert.alert(
        'Could not submit',
        text,
        screen
          ? [
              { text: 'OK', style: 'cancel' },
              { text: 'Edit details', onPress: () => navigation.navigate(screen) },
            ]
          : undefined
      );
      return true;
    }
    return false;
  };

  const { submit, submitting, dialog } = useRegistrationSubmit(navigation, { onError });

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
    const current = files[doc.field_key];
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
    if (cpDocuments.status === 'loading' || cpDocuments.status === 'idle') {
      Alert.alert('Documents', 'Loading the document list, please wait.');
      return;
    }
    const missing = docs.filter((d) => required[d.field_key] && !files[d.field_key]);
    if (missing.length) {
      Alert.alert('Documents required', `Please upload: ${missing.map((d) => d.name).join(', ')}`);
      return;
    }
    submit();
  };

  const loading = cpDocuments.status === 'loading' || cpDocuments.status === 'idle';

  return (
    <SafeAreaView edges={['top']} style={s.root}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <WizardHeader
          step={4}
          total={4}
          title="Upload Documents"
          subtitle="Upload your business documents. JPG, PNG or PDF, up to 5 MB each."
          onBack={() => navigation.goBack()}
        />

        <View style={s.body}>
          {loading && !docs.length ? <LoadingState /> : null}
          {cpDocuments.status === 'failed' ? <ErrorState message={cpDocuments.error} onRetry={cpDocuments.reload} /> : null}
          {cpDocuments.status === 'succeeded' && !docs.length ? (
            <Text style={s.hint}>No documents are needed for this business type. You can submit your application.</Text>
          ) : null}

          <View style={{ gap: spacing.md }}>
            {docs.map((doc) => {
              const file = files[doc.field_key];
              const req = required[doc.field_key];
              const flagged = req && !file;
              return (
                <View key={doc.field_key} style={[s.docRow, flagged && s.docRowError]}>
                  <View style={s.docIcon}>
                    <Icon name="file-text" size={18} color={colors.brandPrimary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.docTitle}>{doc.name}</Text>
                    {file ? <Text style={s.docHint} numberOfLines={1}>{file.name}</Text> : null}
                    <Text style={[s.docTag, req && { color: colors.error }]}>{req ? 'Required' : 'Optional'}</Text>
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
      </ScrollView>
      {dialog}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { paddingBottom: spacing.xxxl },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  hint: { ...type.caption, color: colors.muted, marginBottom: spacing.md },

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
  docRowError: { borderColor: colors.error },
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
