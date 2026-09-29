import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import { Divider, SecondaryButton } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { terms } from '../data';

/** Figma frame: `meraqui-terms-conditions` (12:3095). */
export default function TermsScreen() {
  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <PageTitle>Terms &amp; Conditions</PageTitle>

      <View style={{ paddingHorizontal: spacing.lg }}>
        <Text style={s.intro}>{terms.intro}</Text>
        <Text style={s.updated}>{terms.updated}</Text>

        {terms.sections.map((section) => (
          <View key={section.id}>
            <Divider style={{ marginVertical: spacing.xl }} />
            <Text style={s.title}>{section.title}</Text>
            <Text style={s.body}>{section.body}</Text>
          </View>
        ))}

        <Divider style={{ marginVertical: spacing.xl }} />

        <View style={s.helpRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.helpTitle}>{terms.help.title}</Text>
            <Text style={s.helpBody}>{terms.help.body}</Text>
          </View>
          <SecondaryButton
            label={terms.help.cta}
            onPress={() => Alert.alert(terms.help.title, terms.help.body)}
            style={s.helpBtn}
          />
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  intro: { ...type.body, color: colors.muted, lineHeight: 24 },
  updated: { ...type.bodySmall, color: colors.onSurfaceTertiary, marginTop: spacing.sm },
  title: { ...type.body, color: colors.onSurface, fontSize: 18, lineHeight: 26 },
  body: { ...type.bodySmall, color: colors.muted, lineHeight: 24, marginTop: spacing.sm },
  helpRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  helpTitle: { ...type.body, color: colors.onSurface },
  helpBody: { ...type.caption, color: colors.muted, marginTop: spacing.xs, lineHeight: 18 },
  helpBtn: { height: 44, borderRadius: radius.pill, paddingHorizontal: spacing.lg },
});
