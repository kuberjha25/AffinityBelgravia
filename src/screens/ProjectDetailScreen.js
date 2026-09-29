import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { Card, PrimaryButton, SecondaryButton, Divider } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { project } from '../data';
import { imageFill } from '../components/fill';

/** Figma frame: `project-detail-screen` (12:1440). */
export default function ProjectDetailScreen({ navigation }) {
  const [config, setConfig] = useState(project.configurations[1].id);

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <View style={s.hero}>
        <Image source={project.hero} style={imageFill} resizeMode="cover" />
        <LinearGradient colors={['rgba(28,27,25,0.1)', 'rgba(28,27,25,0.75)']} style={StyleSheet.absoluteFill} />
        <View style={s.heroCopy}>
          <Text style={s.heroTitle}>{project.name}</Text>
          <View style={s.inline}>
            <Icon name="map-pin" size={14} color={colors.brandTertiary} />
            <Text style={s.heroLocation}>{project.location}</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginTop: -28 }}>
        <Card style={s.statsCard}>
          <Stat label="Total Units" value={project.totalUnits} />
          <View style={s.statDivider} />
          <Stat label="Available" value={project.available} highlight />
          <View style={s.statDivider} />
          <Stat label="Price Range" value={project.priceRange} compact />
        </Card>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg }}>
        <Card>
          <Text style={s.cardTitle}>Project Overview</Text>
          <Text style={s.overview}>{project.overview}</Text>
          <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
            {Object.entries(project.facts).map(([label, value]) => (
              <View key={label}>
                <Text style={s.factLabel}>{label}</Text>
                <Text style={s.factValue}>{value}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Text style={s.sectionTitle}>Unit Configurations</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md, paddingTop: spacing.md }}
      >
        {project.configurations.map((c) => {
          const active = config === c.id;
          return (
            <Pressable key={c.id} onPress={() => setConfig(c.id)} style={[s.configCard, active && s.configCardActive]}>
              <Text style={s.configTitle}>{c.title}</Text>
              <Text style={s.configArea}>{c.area}</Text>
              <Text style={s.configPrice}>{c.price}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg }}>
        <PrimaryButton label="View Inventory" onPress={() => navigation.navigate('Inventory')} />

        <Text style={s.sectionTitle}>Amenities</Text>
        <Card>
          <View style={s.amenityGrid}>
            {project.amenities.map((a) => (
              <View key={a.id} style={s.amenity}>
                <View style={s.amenityIcon}>
                  <Icon name={a.icon} size={20} color={colors.brandPrimary} />
                </View>
                <Text style={s.amenityLabel}>{a.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <SecondaryButton label="Documents" icon="download" onPress={() => navigation.navigate('Documents')} />
      </View>
    </Screen>
  );
}

function Stat({ label, value, highlight, compact }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4 }}>
      <Text style={s.statLabel}>{label}</Text>
      <Text
        style={[s.statValue, compact && s.statValueCompact, highlight && { color: colors.brandPrimary }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { height: 210, justifyContent: 'flex-end' },
  heroCopy: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heroTitle: { ...type.title, color: colors.onSurfaceInverse, letterSpacing: 3 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
  heroLocation: { ...type.bodySmall, color: 'rgba(255,255,255,0.9)' },

  statsCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
  statDivider: { width: 1, height: 36, backgroundColor: colors.divider },
  statLabel: { ...type.caption, color: colors.muted },
  statValue: { ...type.heading, color: colors.onSurface, marginTop: 2 },
  statValueCompact: { fontSize: 16, lineHeight: 24 },

  cardTitle: { ...type.heading, color: colors.onSurface },
  overview: { ...type.bodySmall, color: colors.muted, marginTop: spacing.md, lineHeight: 22 },
  factLabel: { ...type.caption, color: colors.muted },
  factValue: { ...type.body, color: colors.onSurface, marginTop: 2 },

  sectionTitle: { ...type.heading, color: colors.onSurface },

  configCard: {
    width: 148,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.lg,
  },
  configCardActive: { borderColor: colors.brandPrimary, borderWidth: borderWidth.selected },
  configTitle: { ...type.body, color: colors.onSurface },
  configArea: { ...type.caption, color: colors.muted, marginTop: spacing.sm },
  configPrice: { ...type.bodySmall, color: colors.brandPrimary, marginTop: spacing.sm },

  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  amenity: { width: '25%', alignItems: 'center', paddingVertical: spacing.md },
  amenityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: { ...type.caption, color: colors.onSurfaceTertiary, marginTop: spacing.sm },
});
