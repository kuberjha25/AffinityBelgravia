import React from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import { Card, Divider, PrimaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { about, brand } from '../data';
import { imageFill } from '../components/fill';

/** Figma frame: `about-screen` (12:3233). */
export default function AboutScreen() {
  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <PageTitle subtitle={about.subtitle}>{about.title}</PageTitle>

      <View style={{ paddingHorizontal: spacing.lg }}>
        <View style={s.hero}>
          <Image source={about.hero} style={imageFill} resizeMode="cover" />
          <LinearGradient colors={['rgba(28,27,25,0)', 'rgba(28,27,25,0.55)']} style={StyleSheet.absoluteFill} />
          <View style={s.established}>
            <Text style={s.establishedLabel}>{brand.establishedLabel}</Text>
          </View>
        </View>

        <Text style={s.wordmark}>{about.wordmark}</Text>
        <Text style={s.intro}>{about.intro}</Text>

        <Divider style={{ marginVertical: spacing.xl }} />

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          {about.pillars.map((p) => (
            <Card key={p.id} style={{ flex: 1 }}>
              <Icon name={p.icon} size={20} color={colors.brandPrimary} />
              <Text style={s.pillarTitle}>{p.title}</Text>
              <Text style={s.pillarBody}>{p.body}</Text>
            </Card>
          ))}
        </View>

        <Divider style={{ marginVertical: spacing.xl }} />

        <Text style={s.sectionTitle}>Project Highlights</Text>
        <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
          {about.highlights.map((h) => (
            <View key={h.id} style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={s.checkCircle}>
                <Icon name="check" size={12} color={colors.brandPrimary} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.highlightTitle}>{h.title}</Text>
                <Text style={s.highlightBody}>{h.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Divider style={{ marginVertical: spacing.xl }} />

        <Text style={s.sectionTitle}>{about.contact.title}</Text>
        <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
          <ContactRow icon="phone" text={about.contact.phone} />
          <ContactRow icon="mail" text={about.contact.email} />
          <ContactRow icon="map-pin" text={about.contact.address} />
        </View>

        <PrimaryButton
          label={about.contact.cta}
          onPress={() => Alert.alert(about.contact.cta, `We will reply at ${about.contact.email}.`)}
          style={{ marginTop: spacing.xl }}
        />

        <Text style={s.footer}>{about.footer}</Text>
        <Text style={s.version}>{`Version ${brand.aboutVersion}`}</Text>
      </View>
    </Screen>
  );
}

function ContactRow({ icon, text }) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
      <View style={{ paddingTop: 2 }}>
        <Icon name={icon} size={16} color={colors.brandPrimary} />
      </View>
      <Text style={s.contactText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { height: 180, borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  established: {
    alignSelf: 'flex-start',
    margin: spacing.lg,
    height: 28,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(28,27,25,0.66)',
    justifyContent: 'center',
  },
  establishedLabel: { ...type.caption, color: colors.onSurfaceInverse, letterSpacing: 1.5 },

  wordmark: { ...type.title, color: colors.onSurface, letterSpacing: 4, marginTop: spacing.xl },
  intro: { ...type.bodySmall, color: colors.muted, lineHeight: 24, marginTop: spacing.md },

  pillarTitle: { ...type.body, color: colors.onSurface, marginTop: spacing.md },
  pillarBody: { ...type.caption, color: colors.muted, lineHeight: 18, marginTop: spacing.sm },

  sectionTitle: { ...type.heading, color: colors.onSurface },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: borderWidth.default,
    borderColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightTitle: { ...type.body, color: colors.onSurface },
  highlightBody: { ...type.bodySmall, color: colors.muted, lineHeight: 22, marginTop: spacing.xs },

  contactText: { ...type.bodySmall, color: colors.onSurfaceTertiary, flex: 1, lineHeight: 22 },

  footer: { ...type.caption, color: colors.muted, textAlign: 'center', marginTop: spacing.xl },
  version: { ...type.caption, color: colors.brandPrimary, textAlign: 'center', marginTop: spacing.xs },
});
