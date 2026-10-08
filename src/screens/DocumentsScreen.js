import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { Card, StatusPill, BottomSheet, PrimaryButton, TextField } from '../components/ui';
import WhatsAppRecipient, { recipientNumber, sendOnWhatsApp } from '../components/WhatsAppRecipient';
import { useApp } from '../store';
import { BannerHeader } from './InventoryScreen';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { documents, documentsHeader } from '../data';

const TAG_TONE = {
  Marketing: 'error',
  Pricing: 'warning',
  Legal: 'success',
  Technical: 'neutral',
};

const TAG_ICON_BG = {
  Marketing: 'rgba(180,83,74,0.10)',
  Pricing: 'rgba(62,107,79,0.10)',
  Legal: colors.surfaceTertiary,
  Technical: colors.surfaceTertiary,
};

const shareMessage = (doc, name) =>
  `Hi${name ? ` ${name.split(' ')[0]}` : ''}, sharing the ${doc.title} of Affinity Belgravia with you. Regards, Team Affinity Belgravia`;

/**
 * Figma frame: `inventory-accordion-screen` @ 7931 (12:1797) — the documents list.
 * Staff can also share a document on WhatsApp (#6): select document → select
 * user → registered number (or another) → send.
 */
export default function DocumentsScreen() {
  const { can, associates } = useApp();
  const canShare = can('document.share');
  const [sharing, setSharing] = useState(null);
  const [recipient, setRecipient] = useState({ userId: null, useRegistered: true, otherNumber: '' });
  const [message, setMessage] = useState('');

  const openShare = (doc) => {
    setSharing(doc);
    setRecipient({ userId: null, useRegistered: true, otherNumber: '' });
    setMessage(shareMessage(doc, ''));
  };

  const onRecipientChange = (patch) => {
    setRecipient((r) => ({ ...r, ...patch }));
    if (patch.userId) {
      const name = associates.find((a) => a.id === patch.userId)?.name;
      setMessage(shareMessage(sharing, name));
    }
  };

  const send = () => {
    if (!recipient.userId) {
      Alert.alert('Select user', 'Please select who to send the document to.');
      return;
    }
    const number = recipientNumber(recipient, associates);
    if (!number) {
      Alert.alert('WhatsApp number', 'Please enter a valid WhatsApp number.');
      return;
    }
    sendOnWhatsApp(number, message.trim());
    setSharing(null);
  };

  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <BannerHeader {...documentsHeader} />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md }}>
        {documents.map((doc) => (
          <Card key={doc.id} style={s.row}>
            <View style={[s.icon, { backgroundColor: TAG_ICON_BG[doc.tag] }]}>
              <Icon name="file-text" size={18} color={colors.brandPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{doc.title}</Text>
              <Text style={s.size}>{doc.size}</Text>
            </View>
            <StatusPill label={doc.tag} tone={TAG_TONE[doc.tag]} />
            <Pressable
              style={s.downloadBtn}
              onPress={() => Alert.alert('Download', `${doc.title} (${doc.size}) queued for download.`)}
            >
              <Icon name="download" size={16} color={colors.brandPrimary} />
            </Pressable>
            {canShare ? (
              <Pressable style={s.downloadBtn} onPress={() => openShare(doc)} accessibilityLabel={`Share ${doc.title} on WhatsApp`}>
                <Icon name="upload" size={16} color={colors.brandPrimary} />
              </Pressable>
            ) : null}
          </Card>
        ))}
      </View>

      <BottomSheet visible={Boolean(sharing)} onClose={() => setSharing(null)} title="Share on WhatsApp">
        {sharing ? (
          <ScrollView style={{ maxHeight: 560 }} contentContainerStyle={{ gap: spacing.lg }} keyboardShouldPersistTaps="handled">
            <View style={s.sharingDoc}>
              <Icon name="file-text" size={18} color={colors.brandPrimary} />
              <Text style={s.title}>{`${sharing.title} • ${sharing.size}`}</Text>
            </View>
            <WhatsAppRecipient value={recipient} onChange={onRecipientChange} />
            <TextField label="Message" value={message} onChangeText={setMessage} multiline />
            <PrimaryButton label="Send on WhatsApp" iconRight="arrow-right" onPress={send} />
            <Text style={s.note}>
              The file itself is attached once the WhatsApp Business Account is connected; until then
              WhatsApp opens with this message.
            </Text>
          </ScrollView>
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.bodySmall, color: colors.onSurface },
  size: { ...type.caption, color: colors.muted, marginTop: 2, letterSpacing: 1 },
  sharingDoc: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  note: { ...type.caption, color: colors.muted, textAlign: 'center' },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: borderWidth.default,
    borderColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
