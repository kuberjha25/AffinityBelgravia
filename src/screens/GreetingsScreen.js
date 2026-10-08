import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import { Card, PrimaryButton, TextField, EmptyState } from '../components/ui';
import WhatsAppRecipient, { recipientNumber, sendOnWhatsApp } from '../components/WhatsAppRecipient';
import { parseDisplayDate } from '../components/DateField';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { greetingTemplates } from '../config';
import { useApp } from '../store';

const OCCASIONS = Object.keys(greetingTemplates); // Birthday, Anniversary
const DAY = 24 * 60 * 60 * 1000;

/** Days from today until the next yearly occurrence of a "15 Mar 1990" style date. */
function daysUntil(dateStr) {
  const t = parseDisplayDate(dateStr);
  if (!t) return null;
  const d = new Date(t);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) next = new Date(today.getFullYear() + 1, d.getMonth(), d.getDate());
  return Math.round((next - today) / DAY);
}

const fill = (template, name) => template.replace(/\{name\}/g, name.split(' ')[0]);

/**
 * #5 Birthday / Anniversary greetings to CP / Freelancer / Influencer over WhatsApp.
 * Flow from the review: select user → registered number shown (or enter
 * another) → pick the greeting → send.
 */
export default function GreetingsScreen() {
  const { associates, can } = useApp();
  const [recipient, setRecipient] = useState({ userId: null, useRegistered: true, otherNumber: '' });
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [templateIndex, setTemplateIndex] = useState(0);
  const [message, setMessage] = useState('');

  const user = associates.find((a) => a.id === recipient.userId);

  const upcoming = useMemo(() => {
    const list = [];
    associates.forEach((a) => {
      [['Birthday', a.dob], ['Anniversary', a.anniversary]].forEach(([kind, date]) => {
        const days = daysUntil(date);
        if (days != null && days <= 30) list.push({ key: `${a.id}-${kind}`, person: a, kind, days });
      });
    });
    return list.sort((x, y) => x.days - y.days);
  }, [associates]);

  const choose = ({ userId, kind, index }) => {
    const name = associates.find((a) => a.id === userId)?.name || '';
    const k = kind ?? occasion;
    const i = index ?? 0;
    setOccasion(k);
    setTemplateIndex(i);
    setMessage(name ? fill(greetingTemplates[k][i], name) : '');
  };

  const onRecipientChange = (patch) => {
    setRecipient((r) => ({ ...r, ...patch }));
    if (patch.userId) choose({ userId: patch.userId, kind: occasion, index: templateIndex });
  };

  const send = () => {
    if (!user) {
      Alert.alert('Select user', 'Please select who the greeting is for.');
      return;
    }
    const number = recipientNumber(recipient, associates);
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
      <PageTitle subtitle="Send Birthday & Anniversary wishes to CP / Freelancer / Influencer on WhatsApp">
        Greetings
      </PageTitle>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
        {upcoming.length ? (
          <Card style={{ gap: spacing.sm }}>
            <Text style={s.cardTitle}>Coming up in the next 30 days</Text>
            {upcoming.map((u) => (
              <Pressable
                key={u.key}
                style={s.upcomingRow}
                onPress={() => {
                  setRecipient({ userId: u.person.id, useRegistered: true, otherNumber: '' });
                  choose({ userId: u.person.id, kind: u.kind, index: 0 });
                }}
              >
                <View style={s.upcomingIcon}>
                  <Icon name={u.kind === 'Birthday' ? 'gift' : 'heart'} size={16} color={colors.brandPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.upcomingName}>{u.person.name}</Text>
                  <Text style={s.upcomingMeta}>
                    {`${u.kind} • ${u.days === 0 ? 'Today' : u.days === 1 ? 'Tomorrow' : `in ${u.days} days`}`}
                  </Text>
                </View>
                <Icon name="chevron-right" size={16} color={colors.muted} />
              </Pressable>
            ))}
          </Card>
        ) : null}

        <WhatsAppRecipient value={recipient} onChange={onRecipientChange} />

        <View style={{ gap: spacing.sm }}>
          <Text style={s.label}>Occasion</Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            {OCCASIONS.map((k) => {
              const active = occasion === k;
              const date = k === 'Birthday' ? user?.dob : user?.anniversary;
              return (
                <Pressable
                  key={k}
                  onPress={() => choose({ userId: recipient.userId, kind: k, index: 0 })}
                  style={[s.occasion, active && s.occasionActive]}
                >
                  <Icon name={k === 'Birthday' ? 'gift' : 'heart'} size={16} color={active ? colors.onSurfaceInverse : colors.brandPrimary} />
                  <View>
                    <Text style={[s.occasionLabel, active && { color: colors.onSurfaceInverse }]}>{k}</Text>
                    {date ? (
                      <Text style={[s.occasionDate, active && { color: 'rgba(255,255,255,0.7)' }]}>{date}</Text>
                    ) : null}
                  </View>
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
              <Pressable
                key={i}
                onPress={() => choose({ userId: recipient.userId, kind: occasion, index: i })}
                style={[s.template, active && s.templateActive]}
              >
                <Text style={s.templateText}>{fill(tpl, user?.name || 'Name')}</Text>
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
        <Text style={s.note}>
          WhatsApp opens with the greeting ready to send. Sending directly from the WhatsApp
          Business Account will work once it is connected to the backend.
        </Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  cardTitle: { ...type.body, color: colors.onSurface, marginBottom: spacing.xs },
  label: { ...type.caption, color: colors.onSurfaceTertiary },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  upcomingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingName: { ...type.bodySmall, color: colors.onSurface },
  upcomingMeta: { ...type.caption, color: colors.muted, marginTop: 2 },

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
  occasionDate: { ...type.caption, color: colors.muted },

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
