import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { SelectField, TextField } from './ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { useApp } from '../store';

/**
 * Steps 1–3 of the WhatsApp flows in the 6 Oct review (#5 greetings, #6 documents):
 * select the user → their registered mobile is shown → keep it, or type another
 * WhatsApp number.
 *
 * `value`: { userId, useRegistered, otherNumber }; `onChange(patch)` merges.
 */
export default function WhatsAppRecipient({ value, onChange }) {
  const { associates } = useApp();
  const user = associates.find((a) => a.id === value.userId);
  const label = (a) => `${a.name} • ${a.type}`;

  return (
    <View style={{ gap: spacing.md }}>
      <SelectField
        icon="user"
        label="Select User"
        placeholder="Select CP / Freelancer / Influencer"
        sheetTitle="Select User"
        value={user ? label(user) : ''}
        options={associates.map((a) => ({ label: label(a), value: a.id }))}
        onChange={(userId) => onChange({ userId, useRegistered: true, otherNumber: '' })}
      />

      {user ? (
        <View style={{ gap: spacing.sm }}>
          <Text style={s.label}>WhatsApp Number</Text>
          <Option
            selected={value.useRegistered}
            title="Registered number"
            subtitle={user.phone || 'No number on record'}
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
export function recipientNumber(value, associates) {
  const user = associates.find((a) => a.id === value.userId);
  const raw = value.useRegistered ? user?.phone || '' : value.otherNumber || '';
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
