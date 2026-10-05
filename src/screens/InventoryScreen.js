import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { Card, ChipRow, PrimaryButton, StatusPill, EmptyState, toneForStatus } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { inventory, inventoryHeader, inventoryTowers } from '../data';
import { imageFill } from '../components/fill';

/**
 * Figma frames: `inventory-list-screen` (12:1584) and
 * `inventory-accordion-screen` (12:1681) — one screen, collapsed and expanded.
 */
export default function InventoryScreen() {
  const [tower, setTower] = useState('All');
  const [open, setOpen] = useState(null);

  const rows = useMemo(
    () => (tower === 'All' ? inventory : inventory.filter((i) => i.tower === tower)),
    [tower]
  );

  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <BannerHeader {...inventoryHeader} />

      <ChipRow
        options={inventoryTowers}
        value={tower}
        onChange={setTower}
        style={{ marginTop: spacing.lg }}
        contentStyle={{ paddingHorizontal: spacing.lg }}
      />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md }}>
        {rows.map((unit) => {
          const expanded = open === unit.id;
          return (
            <Card key={unit.id} selected={expanded} style={expanded ? { padding: spacing.lg } : undefined}>
              <Pressable onPress={() => setOpen(expanded ? null : unit.id)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Text style={s.unitTitle}>{unit.title}</Text>
                  {expanded ? (
                    <View style={s.unitChip}>
                      <Text style={s.unitChipLabel}>{unit.title}</Text>
                    </View>
                  ) : null}
                  <View style={{ flex: 1 }} />
                  <StatusPill label={unit.status} tone={toneForStatus(unit.status)} />
                  {expanded ? <Icon name="chevron-left" size={18} color={colors.muted} /> : null}
                </View>

                {!expanded ? (
                  <View style={s.collapsedRow}>
                    <Text style={s.area}>
                      <Text style={{ color: colors.muted }}>Area: </Text>
                      {unit.area}
                    </Text>
                    <View style={s.inline}>
                      <Icon name="chevron-right" size={14} color={colors.brandPrimary} />
                      <Text style={s.link}>Details &amp; Layout</Text>
                    </View>
                  </View>
                ) : null}
              </Pressable>

              {expanded ? (
                <>
                  <View style={s.detailGrid}>
                    {Object.entries(unit.details).map(([label, value]) => (
                      <View key={label} style={s.detailCell}>
                        <Text style={s.detailLabel}>{label}</Text>
                        <Text style={s.detailValue}>{value}</Text>
                      </View>
                    ))}
                  </View>
                  <PrimaryButton
                    label="View Floor Plan"
                    onPress={() => Alert.alert('Floor Plan', `${unit.title} — ${unit.details.Floor}`)}
                    style={{ marginTop: spacing.lg }}
                  />
                </>
              ) : null}
            </Card>
          );
        })}

        {rows.length === 0 ? (
          <EmptyState icon="shopping-bag" title="No units in this tower" body="Pick another tower to see availability." />
        ) : null}
      </View>
    </Screen>
  );
}

/** Shared banner used by the inventory and documents screens. */
export function BannerHeader({ title, subtitle, meta, image }) {
  return (
    <View style={s.banner}>
      <Image source={image} style={imageFill} resizeMode="cover" />
      <LinearGradient colors={['rgba(28,27,25,0.25)', 'rgba(28,27,25,0.8)']} style={StyleSheet.absoluteFill} />
      <View style={s.bannerCopy}>
        <Text style={s.bannerTitle}>{title}</Text>
        <Text style={s.bannerSubtitle}>{subtitle}</Text>
        <Text style={s.bannerMeta}>{meta}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  banner: { height: 172, justifyContent: 'flex-end' },
  bannerCopy: { padding: spacing.lg },
  bannerTitle: { ...type.title, color: colors.onSurfaceInverse, letterSpacing: 3 },
  bannerSubtitle: { ...type.title, color: colors.onSurfaceInverse, letterSpacing: 3 },
  bannerMeta: { ...type.bodySmall, color: 'rgba(255,255,255,0.86)', marginTop: spacing.xs },

  unitTitle: { ...type.heading, color: colors.onSurface },
  unitChip: {
    height: 24,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTertiary,
    justifyContent: 'center',
  },
  unitChipLabel: { ...type.caption, color: colors.onSurfaceTertiary, letterSpacing: 1 },

  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  area: { ...type.bodySmall, color: colors.onSurface },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  link: { ...type.bodySmall, color: colors.brandPrimary },

  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.lg },
  detailCell: { width: '50%', paddingBottom: spacing.lg, paddingRight: spacing.md },
  detailLabel: { ...type.caption, color: colors.muted },
  detailValue: { ...type.bodySmall, color: colors.onSurface, marginTop: 2 },
});
