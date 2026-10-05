import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import { colors, radius, spacing, type, borderWidth, shadow } from '../theme';
import { projects } from '../data';
import { imageFill } from '../components/fill';

/**
 * Project list behind the Home "Project" tile. The review asked for the tile
 * to land on a list rather than jump straight into one project's details.
 */
export default function ProjectsScreen({ navigation }) {
  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <PageTitle subtitle="Select a project to view details, inventory and documents">Projects</PageTitle>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
        {projects.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => navigation.navigate('ProjectDetail', { id: p.id })}
            style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}
          >
            <View style={s.imageWrap}>
              <Image source={p.image} style={imageFill} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(28,27,25,0)', 'rgba(28,27,25,0.75)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={s.imageCopy}>
                <Text style={s.name} numberOfLines={1} adjustsFontSizeToFit>{p.name}</Text>
                <View style={s.inline}>
                  <Icon name="map-pin" size={14} color={colors.brandTertiary} />
                  <Text style={s.location}>{p.location}</Text>
                </View>
              </View>
            </View>

            <View style={s.metaRow}>
              <Meta label="Configurations" value={p.configurations} />
              <View style={s.metaDivider} />
              <Meta label="Price Range" value={p.priceRange} />
              <View style={s.metaDivider} />
              <Meta label="Available" value={`${p.available} Units`} highlight />
            </View>

            <View style={s.footer}>
              <Text style={s.possession}>{`Possession: ${p.possession}`}</Text>
              <View style={s.inline}>
                <Text style={s.view}>View Details</Text>
                <Icon name="chevron-right" size={16} color={colors.brandPrimary} />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function Meta({ label, value, highlight }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4 }}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text
        style={[s.metaValue, highlight && { color: colors.brandPrimary }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.xl,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  imageWrap: { height: 180, justifyContent: 'flex-end' },
  imageCopy: { padding: spacing.lg },
  name: { ...type.title, fontSize: 20, color: colors.onSurfaceInverse, letterSpacing: 3 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
  location: { ...type.bodySmall, color: 'rgba(255,255,255,0.9)' },

  metaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
  metaDivider: { width: 1, height: 32, backgroundColor: colors.divider },
  metaLabel: { ...type.caption, color: colors.muted },
  metaValue: { ...type.bodySmall, color: colors.onSurface, marginTop: 2 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: borderWidth.default,
    borderTopColor: colors.divider,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  possession: { ...type.caption, color: colors.onSurfaceTertiary },
  view: { ...type.bodySmall, color: colors.brandPrimary },
});
