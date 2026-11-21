import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import KeyboardActionBar, { ACTION_BAR_HEIGHT } from '../components/KeyboardActionBar';
import { WizardHeader, TextField, SelectField, PrimaryButton } from '../components/ui';
import { colors, spacing, type } from '../theme';
import { businessTypesFallback } from '../data';
import { patchOnboarding, setRequiredDocs } from '../store/slices/onboardingSlice';
import { useKeyedLookup, useLookup } from '../hooks';
import { useRegistrationSubmit } from '../components/RegistrationSubmit';
import { readRegistrationErrors, screenForField } from '../registrationErrors';

/**
 * Figma frame: `channel-partner-details` (12:292) — wizard step 3 of 4, channel partners only.
 * Company details and business type (GET /business-types, bundled copy if that fails).
 *
 * "Submit" sends the registration as before. The API answers a missing
 * document with a 422 (`documents.<field_key>` … required); that isn't shown
 * as an error — the partner goes to Upload Documents with exactly those
 * documents marked Required. Any other validation error is shown here. If the
 * API needs no documents, the registration simply completes.
 */
export default function ChannelPartnerDetailsScreen({ navigation }) {
  const dispatch = useDispatch();
  const onboarding = useSelector((state) => state.onboarding);
  const businessTypes = useLookup('businessTypes');
  const [business, setBusiness] = useState(onboarding.business);
  // Start loading the chosen type's documents so the next screen opens with them.
  useKeyedLookup('cpDocuments', business.businessType);
  const allCpDocuments = useSelector((state) => state.lookups.cpDocuments);

  const onError = (message, fieldErrors) => {
    const known = [];
    Object.values(allCpDocuments).forEach((entry) =>
      (entry?.items || []).forEach((d) => {
        if (!known.some((k) => k.field_key === d.field_key)) known.push(d);
      })
    );
    const { docs, others } = readRegistrationErrors(message, fieldErrors, known);
    if (others.length) {
      const screen = screenForField(others[0].key);
      Alert.alert(
        'Could not submit',
        others.map((o) => o.message).join('\n'),
        screen && screen !== 'ChannelPartnerDetails'
          ? [
              { text: 'OK', style: 'cancel' },
              { text: 'Edit details', onPress: () => navigation.navigate(screen) },
            ]
          : undefined
      );
      return true;
    }
    if (Object.keys(docs).length) {
      dispatch(setRequiredDocs(docs));
      navigation.navigate('UploadDocuments');
      return true;
    }
    return false;
  };
  const { submit, submitting, dialog } = useRegistrationSubmit(navigation, { onError });

  const set = (key) => (value) => setBusiness((b) => ({ ...b, [key]: value }));
  const upper = (key) => (value) => set(key)(value.toUpperCase());

  const onSubmit = () => {
    if (!business.companyName.trim()) {
      Alert.alert('Company name', 'Please enter the registered business name.');
      return;
    }
    if (!business.businessType) {
      Alert.alert('Business type', 'Please select the business type.');
      return;
    }
    // The API's answer decides which documents are required, fresh each time.
    dispatch(setRequiredDocs(null));
    dispatch(patchOnboarding({ business }));
    submit();
  };

  const typeRows = businessTypes.items?.length
    ? businessTypes.items
    : businessTypes.status === 'failed'
      ? businessTypesFallback
      : [];
  const typeOptions = typeRows.map((b) => ({ label: b.name, value: b.slug }));
  const businessLabel = typeOptions.find((b) => b.value === business.businessType)?.label || '';

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
          total={4}
          title={onboarding.mode === 'admin' ? 'Register Partner' : 'Complete Profile'}
          subtitle="Please provide your company details."
          onBack={() => navigation.goBack()}
        />

        <View style={s.body}>
          <Text style={s.groupLabel}>Company Details</Text>
          <View style={{ gap: spacing.md }}>
            <TextField icon="building" label="Company / Entity Name" placeholder="Enter registered business name" value={business.companyName} onChangeText={set('companyName')} />
            <SelectField
              icon="briefcase"
              label="Business Type"
              placeholder={businessTypes.status === 'loading' ? 'Loading business types…' : 'Select business type'}
              value={businessLabel}
              options={typeOptions}
              onChange={set('businessType')}
            />
            {businessTypes.status === 'succeeded' && !typeOptions.length ? (
              <Text style={s.warn}>
                No business types have been set up yet, so channel partner registration can’t be completed. Please
                contact the Affinity Belgravia team.
              </Text>
            ) : null}
            {businessTypes.status === 'failed' ? (
              <Text style={s.warn} onPress={businessTypes.reload}>
                Couldn’t load business types — showing the standard list. Tap to retry.
              </Text>
            ) : null}
            <TextField icon="file-text" label="GST Number" placeholder="Enter GSTIN" value={business.gstNumber} onChangeText={upper('gstNumber')} autoCapitalize="characters" maxLength={15} />
            <TextField icon="file-text" label="PAN Number" placeholder="Enter PAN" value={business.panNumber} onChangeText={upper('panNumber')} autoCapitalize="characters" maxLength={10} />
            <TextField icon="file-text" label="RERA Registration Number" placeholder="Enter RERA registration number" value={business.reraNumber} onChangeText={upper('reraNumber')} autoCapitalize="characters" />
            <TextField icon="file-text" label="MSME / Udyam Number" placeholder="Optional" value={business.msmeNumber} onChangeText={upper('msmeNumber')} autoCapitalize="characters" />
          </View>

          <PrimaryButton label="Submit" onPress={onSubmit} loading={submitting} style={{ marginTop: spacing.xl }} />
        </View>
      </KeyboardAwareScrollView>
      <KeyboardActionBar>
        <PrimaryButton label="Submit" onPress={onSubmit} loading={submitting} />
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
  warn: { ...type.caption, color: colors.error, marginTop: -spacing.xs },

});
