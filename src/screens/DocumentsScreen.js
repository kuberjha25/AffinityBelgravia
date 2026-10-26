import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import {
  Card,
  StatusPill,
  BottomSheet,
  PrimaryButton,
  TextField,
  SectionTitle,
  EmptyState,
  ErrorState,
  LoadingState,
  LoadMore,
} from '../components/ui';
import WhatsAppRecipient, { emptyRecipient, recipientNumber, sendOnWhatsApp } from '../components/WhatsAppRecipient';
import { BannerHeader } from './InventoryScreen';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { images } from '../data';
import { usePermissions } from '../store';
import { fetchDocuments } from '../store/slices/contentSlice';
import { hasMore } from '../store/helpers';

const TAG_TONE = { Marketing: 'error', Pricing: 'warning', Legal: 'success', Technical: 'neutral' };

const shareMessage = (doc, name) =>
  `Hi${name ? ` ${name.split(' ')[0]}` : ''}, sharing the ${doc.title}${doc.projectName ? ` of ${doc.projectName}` : ''} with you: ${doc.file_url}\nRegards, Team Affinity Belgravia`;

/**
 * Figma frame: `inventory-accordion-screen` @ 7931 (12:1797) — the documents list.
 * Staff can also share a document on WhatsApp (#6): select document → select
 * user → registered number (or another) → send.
 */
export default function DocumentsScreen({ route }) {
  const dispatch = useDispatch();
  const projectId = route?.params?.projectId;
  const list = useSelector((state) => state.content.documents);
  const { can } = usePermissions();
  const canShare = can('document.share');
  const [sharing, setSharing] = useState(null);
  const [recipient, setRecipient] = useState(emptyRecipient);
  const [message, setMessage] = useState('');

  const load = (page = 1) => dispatch(fetchDocuments({ project_id: projectId, page }));

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const groups = list.items;
  const banner = groups.length === 1 ? groups[0] : null;

  const open = (doc) => {
    if (!doc.file_url) return;
    Linking.openURL(doc.file_url).catch(() => Alert.alert('Download', 'Could not open this file.'));
  };

  const openShare = (doc) => {
    setSharing(doc);
    setRecipient(emptyRecipient);
    setMessage(shareMessage(doc, ''));
  };

  const onRecipientChange = (patch) => {
    setRecipient((r) => ({ ...r, ...patch }));
    if (patch.person) setMessage(shareMessage(sharing, patch.person.name));
  };

  const send = () => {
    if (!recipient.person) {
      Alert.alert('Select user', 'Please select who to send the document to.');
      return;
    }
    const number = recipientNumber(recipient);
    if (!number) {
      Alert.alert('WhatsApp number', 'Please enter a valid WhatsApp number.');
      return;
    }
    sendOnWhatsApp(number, message.trim());
    setSharing(null);
  };

  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }} onRefresh={() => load(1)}>
      <BannerHeader
        title={banner ? String(banner.name).toUpperCase() : 'AFFINITY BELGRAVIA'}
        subtitle="DOCUMENTS"
        meta={banner?.location || ''}
        image={images.heroInventory}
      />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md }}>
        {groups.map((group) => (
          <View key={group.id} style={{ gap: spacing.md }}>
            {groups.length > 1 ? <SectionTitle style={{ marginTop: spacing.sm }}>{group.name}</SectionTitle> : null}
            {(group.documents || []).map((doc) => (
              <Card key={doc.id} style={s.row}>
                <View style={[s.icon, { backgroundColor: colors.glassTint }]}>
                  <Icon name="file-text" size={18} color={colors.brandPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.title}>{doc.title}</Text>
                  <Text style={s.size}>{[doc.file_extension, doc.file_size].filter(Boolean).join(' • ')}</Text>
                </View>
                {doc.category ? <StatusPill label={doc.category} tone={TAG_TONE[doc.category] || 'neutral'} /> : null}
                <Pressable style={s.actionBtn} onPress={() => open(doc)} accessibilityLabel={`Download ${doc.title}`}>
                  <Icon name="download" size={16} color={colors.brandPrimary} />
                </Pressable>
                {canShare ? (
                  <Pressable
                    style={s.actionBtn}
                    onPress={() => openShare({ ...doc, projectName: group.name })}
                    accessibilityLabel={`Share ${doc.title} on WhatsApp`}
                  >
                    <Icon name="upload" size={16} color={colors.brandPrimary} />
                  </Pressable>
                ) : null}
              </Card>
            ))}
            {!(group.documents || []).length ? <Text style={s.size}>No documents for this project yet.</Text> : null}
          </View>
        ))}

        {list.status === 'loading' && list.page === 0 ? <LoadingState /> : null}
        {list.status === 'failed' && !groups.length ? <ErrorState message={list.error} onRetry={() => load(1)} /> : null}
        {list.status === 'succeeded' && !groups.length ? (
          <EmptyState icon="file" title="No documents yet" body="Project documents will appear here once uploaded." />
        ) : null}
        <LoadMore visible={hasMore(list)} loading={list.status === 'loading' && list.page > 0} onPress={() => load(list.page + 1)} />
      </View>

      <BottomSheet visible={Boolean(sharing)} onClose={() => setSharing(null)} title="Share on WhatsApp">
        {sharing ? (
          <ScrollView style={{ maxHeight: 560 }} contentContainerStyle={{ gap: spacing.lg }} keyboardShouldPersistTaps="handled">
            <View style={s.sharingDoc}>
              <Icon name="file-text" size={18} color={colors.brandPrimary} />
              <Text style={s.title}>{[sharing.title, sharing.file_size].filter(Boolean).join(' • ')}</Text>
            </View>
            <WhatsAppRecipient value={recipient} onChange={onRecipientChange} />
            <TextField label="Message" value={message} onChangeText={setMessage} multiline />
            <PrimaryButton label="Send on WhatsApp" iconRight="arrow-right" onPress={send} />
            <Text style={s.note}>WhatsApp opens with this message and a link to the document.</Text>
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
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: borderWidth.default,
    borderColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
