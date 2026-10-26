import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import { PrimaryButton, TextField, EmptyState } from '../components/ui';
import WhatsAppRecipient, { emptyRecipient, recipientNumber, sendOnWhatsApp } from '../components/WhatsAppRecipient';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { greetingTemplates } from '../data';
import { usePermissions } from '../store';

const OCCASIONS = Object.keys(greetingTemplates); // Birthday, Anniversary

const fill = (template, name) => template.replace(/\{name\}/g, (name || 'Name').split(' ')[0]);

/**
 * #5 Birthday / Anniversary greetings to CP / Broker / Influencer / Freelancer
 * over WhatsApp. Flow from the review: select user → registered number shown
 * (or enter another) → pick the greeting → send.
 */
export default function GreetingsScreen() {
  const { can } = usePermissions();
  const [recipient, setRecipient] = useState(emptyRecipient);
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [templateIndex, setTemplateIndex] = useState(0);
  const [message, setMessage] = useState('');

  const user = recipient.person;

  const choose = ({ person = user, kind = occasion, index = templateIndex }) => {
    setOccasion(kind);
    setTemplateIndex(index);
    setMessage(person ? fill(greetingTemplates[kind][index], person.name) : '');
  };

  const onRecipientChange = (patch) => {
    setRecipient((r) => ({ ...r, ...patch }));
    if ('person' in patch) choose({ person: patch.person });
  };

  const send = () => {
    if (!user) {
      Alert.alert('Select user', 'Please select who the greeting is for.');
      return;
    }
    const number = recipientNumber(recipient);
    if (!number) {
      Alert.alert('WhatsApp number', 'Please enter a valid WhatsApp number.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Greeting', 'Please choose or write a greeting.');
      return;
    }
    sendOnWhatsApp(number, message.trim());
  };

  if (!can('greeting.send')) {
    return (
      <Screen showBack>
        <PageTitle>Greetings</PageTitle>
        <EmptyState icon="gift" title="Not available" body="Greetings are sent by the Affinity Belgravia team." />
      </Screen>
    );
  }

  return (
    <Screen showBack keyboardAction={<PrimaryButton label="Send on WhatsApp" iconRight="arrow-right" onPress={send} />}>
      <PageTitle subtitle="Send Birthday & Anniversary wishes to partners on WhatsApp">Greetings</PageTitle>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
        <WhatsAppRecipient value={recipient} onChange={onRecipientChange} />

        <View style={{ gap: spacing.sm }}>
          <Text style={s.label}>Occasion</Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            {OCCASIONS.map((k) => {
              const active = occasion === k;
              return (
                <Pressable key={k} onPress={() => choose({ kind: k, index: 0 })} style={[s.occasion, active && s.occasionActive]}>
                  <Icon name={k === 'Birthday' ? 'gift' : 'heart'} size={16} color={active ? colors.onSurfaceInverse : colors.brandPrimary} />
                  <Text style={[s.occasionLabel, active && { color: colors.onSurfaceInverse }]}>{k}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={s.label}>Greeting</Text>
          {greetingTemplates[occasion].map((tpl, i) => {
            const active = templateIndex === i;
            return (
              <Pressable key={i} onPress={() => choose({ index: i })} style={[s.template, active && s.templateActive]}>
                <Text style={s.templateText}>{fill(tpl, user?.name)}</Text>
              </Pressable>
            );
          })}
          <TextField
            label="Message (you can edit it)"
            placeholder="Select a user to prepare the greeting"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            showCounter
          />
        </View>

        <PrimaryButton label="Send on WhatsApp" iconRight="arrow-right" onPress={send} />
        <Text style={s.note}>WhatsApp opens with the greeting ready to send.</Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  label: { ...type.caption, color: colors.onSurfaceTertiary },

  occasion: {
    flex: 1,
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  occasionActive: { backgroundColor: colors.surfaceInverse, borderColor: colors.brandPrimary, borderWidth: borderWidth.selected },
  occasionLabel: { ...type.bodySmall, color: colors.onSurface },

  template: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  templateActive: { borderColor: colors.brandPrimary, borderWidth: borderWidth.selected, backgroundColor: colors.glassTint },
  templateText: { ...type.bodySmall, color: colors.onSurfaceTertiary },
  note: { ...type.caption, color: colors.muted, textAlign: 'center' },
});
