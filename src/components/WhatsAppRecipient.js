import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { TextField } from './ui';
import ReferencePicker from './ReferencePicker';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { isMasked } from '../format';

export const emptyRecipient = { person: null, useRegistered: true, otherNumber: '' };

/**
 * Steps 1–3 of the WhatsApp flows in the 6 Oct review (#5 greetings, #6 documents):
 * select the user → their registered mobile is shown → keep it, or type another
 * WhatsApp number.
 *
 * `value`: { person, useRegistered, otherNumber } where `person` is a row from
 * GET /leads/references; `onChange(patch)` merges.
 */
export default function WhatsAppRecipient({ value, onChange }) {
  const user = value.person;
  const registered = user?.mobile && !isMasked(user.mobile) ? user.mobile : '';

  return (
    <View style={{ gap: spacing.md }}>
      <ReferencePicker
        pickerKey="whatsapp"
        label="Select User"
        placeholder="Select CP / Broker / Influencer / Freelancer"
        sheetTitle="Select User"
        value={user}
        onChange={(person) => onChange({ person, useRegistered: true, otherNumber: '' })}
      />

      {user ? (
        <View style={{ gap: spacing.sm }}>
          <Text style={s.label}>WhatsApp Number</Text>
          <Option
            selected={value.useRegistered}
            title="Registered number"
            subtitle={registered || 'No number on record'}
            onPress={() => onChange({ useRegistered: true })}
          />
          <Option
            selected={!value.useRegistered}
            title="Another WhatsApp number"
            subtitle="Use this if the registered number is not on WhatsApp"
            onPress={() => onChange({ useRegistered: false })}
          />
          {!value.useRegistered ? (
            <TextField
              icon="phone"
              placeholder="Enter WhatsApp number"
              value={value.otherNumber}
              onChangeText={(v) => onChange({ otherNumber: v.replace(/[^0-9+ ]/g, '') })}
              keyboardType="phone-pad"
              maxLength={15}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function Option({ selected, title, subtitle, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.option, selected && s.optionSelected]}>
      <View style={[s.radio, selected && s.radioSelected]}>
        {selected ? <View style={s.radioDot} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.optionTitle}>{title}</Text>
        <Text style={s.optionSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

/** The number the message goes to, as digits with country code, or '' if invalid. */
export function recipientNumber(value) {
  const registered = value.person?.mobile && !isMasked(value.person.mobile) ? value.person.mobile : '';
  const raw = value.useRegistered ? registered : value.otherNumber || '';
  let n = raw.replace(/\D/g, '');
  if (n.length === 10) n = `91${n}`; // Indian numbers entered without the country code
  return n.length >= 11 && n.length <= 15 ? n : '';
}

/**
 * Opens WhatsApp with the message ready to send.
 * Until the WhatsApp Business Account API is connected on the backend, this
 * hands off to the WhatsApp app on the phone via wa.me.
 */
export async function sendOnWhatsApp(number, message) {
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('WhatsApp not available', 'Could not open WhatsApp on this device.');
  }
}

const s = StyleSheet.create({
  label: { ...type.caption, color: colors.onSurfaceTertiary },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  optionSelected: { borderColor: colors.brandPrimary, borderWidth: borderWidth.selected },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: borderWidth.selected,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.brandPrimary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brandPrimary },
  optionTitle: { ...type.bodySmall, color: colors.onSurface },
  optionSubtitle: { ...type.caption, color: colors.muted, marginTop: 2 },
});
