import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { Card, StatusPill } from '../components/ui';
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

/** Figma frame: `inventory-accordion-screen` @ 7931 (12:1797) — the documents list. */
export default function DocumentsScreen() {
  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing.xxl }}>
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
          </Card>
        ))}
      </View>
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
