import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { Card, ChipRow, StatusPill, EmptyState, ErrorState, LoadingState } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { images } from '../data';
import { imageFill } from '../components/fill';
import { imageSource } from '../format';
import {
  categoriesKey,
  fetchInventoryCategories,
  fetchProjects,
  fetchTowers,
  fetchUnits,
  towersKey,
  unitsKey,
} from '../store/slices/projectsSlice';

/** For a unit, only "available" is good news; booked / sold units are taken. */
const unitTone = (status) => {
  const v = String(status || '').toLowerCase();
  if (v === 'available') return 'success';
  if (['booked', 'sold', 'blocked'].includes(v)) return 'error';
  return 'warning';
};

/**
 * Figma frames: `inventory-list-screen` (12:1584) and
 * `inventory-accordion-screen` (12:1681) — one screen, collapsed and expanded.
 * Project → tower → configuration → units.
 */
export default function InventoryScreen({ route }) {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.projects.list);
  const [projectId, setProjectId] = useState(route?.params?.projectId ?? null);
  const [towerId, setTowerId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [open, setOpen] = useState(null);

  const pid = projectId ?? projects.items[0]?.id ?? null;
  const project = projects.items.find((p) => p.id === pid);

  const towers = useSelector((state) => (pid ? state.projects.towers.data[towersKey(pid)] : null));
  const towersStatus = useSelector((state) => (pid ? state.projects.towers.status[towersKey(pid)] : null));
  const towersError = useSelector((state) => (pid ? state.projects.towers.error[towersKey(pid)] : null));
  const tid = towerId ?? towers?.[0]?.id ?? null;

  const cKey = pid && tid ? categoriesKey(pid, tid) : null;
  const categories = useSelector((state) => (cKey ? state.projects.categories.data[cKey] : null));
  const categoriesStatus = useSelector((state) => (cKey ? state.projects.categories.status[cKey] : null));
  const cid = categoryId ?? categories?.[0]?.id ?? null;

  const uKey = pid && tid && cid ? unitsKey(pid, tid, cid) : null;
  const units = useSelector((state) => (uKey ? state.projects.units.data[uKey] : null));
  const unitsStatus = useSelector((state) => (uKey ? state.projects.units.status[uKey] : null));
  const unitsError = useSelector((state) => (uKey ? state.projects.units.error[uKey] : null));

  useEffect(() => {
    if (projects.status === 'idle') dispatch(fetchProjects({ page: 1 }));
  }, [dispatch, projects.status]);

  useEffect(() => {
    if (pid) dispatch(fetchTowers(pid));
  }, [dispatch, pid]);

  useEffect(() => {
    if (pid && tid) dispatch(fetchInventoryCategories({ projectId: pid, towerId: tid }));
  }, [dispatch, pid, tid]);

  useEffect(() => {
    if (pid && tid && cid) dispatch(fetchUnits({ projectId: pid, towerId: tid, categoryId: cid }));
  }, [dispatch, pid, tid, cid]);

  const chooseProject = (id) => {
    setProjectId(id);
    setTowerId(null);
    setCategoryId(null);
    setOpen(null);
  };
  const chooseTower = (id) => {
    setTowerId(id);
    setCategoryId(null);
    setOpen(null);
  };

  const refresh = () => {
    if (!pid) return dispatch(fetchProjects({ page: 1 }));
    dispatch(fetchTowers(pid));
    if (tid) dispatch(fetchInventoryCategories({ projectId: pid, towerId: tid }));
    if (cid) dispatch(fetchUnits({ projectId: pid, towerId: tid, categoryId: cid }));
    return undefined;
  };

  const meta = project
    ? [project.towers_count ? `${project.towers_count} Towers` : null, project.units_count ? `${project.units_count} Units` : null]
        .filter(Boolean)
        .join(' • ')
    : '';

  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }} onRefresh={refresh}>
      <BannerHeader
        title={project ? String(project.name).toUpperCase() : 'INVENTORY'}
        subtitle={project ? 'INVENTORY' : ''}
        meta={meta}
        image={imageSource(project?.image_url, images.heroInventory)}
      />

      {projects.items.length > 1 ? (
        <ChipRow
          options={projects.items.map((p) => ({ id: p.id, label: p.name }))}
          value={pid}
          onChange={chooseProject}
          style={{ marginTop: spacing.lg }}
          contentStyle={{ paddingHorizontal: spacing.lg }}
        />
      ) : null}

      {towers?.length ? (
        <ChipRow
          options={towers.map((t) => ({ id: t.id, label: t.name ? `${t.tower} - ${t.name}` : t.tower }))}
          value={tid}
          onChange={chooseTower}
          style={{ marginTop: spacing.md }}
          contentStyle={{ paddingHorizontal: spacing.lg }}
        />
      ) : null}

      {categories?.length ? (
        <ChipRow
          options={categories.map((c) => ({ id: c.id, label: c.name, count: c.inventories_count }))}
          value={cid}
          onChange={(id) => {
            setCategoryId(id);
            setOpen(null);
          }}
          style={{ marginTop: spacing.md }}
          contentStyle={{ paddingHorizontal: spacing.lg }}
        />
      ) : null}

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md }}>
        {(units || []).map((unit) => {
          const expanded = open === unit.id;
          const details = [
            ['Unit', unit.unit_number],
            ['Floor', unit.floor],
            ['Area', unit.formatted_area],
            ['Price', unit.formatted_price],
            ['Tower', unit.project_tower ? [unit.project_tower.tower, unit.project_tower.name].filter(Boolean).join(' - ') : null],
            ['Configuration', unit.inventory_category?.name],
          ].filter(([, v]) => v);
          return (
            <Card key={unit.id} selected={expanded} style={expanded ? { padding: spacing.lg } : undefined}>
              <Pressable onPress={() => setOpen(expanded ? null : unit.id)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Text style={s.unitTitle}>{unit.inventory_category?.name || 'Unit'}</Text>
                  <View style={s.unitChip}>
                    <Text style={s.unitChipLabel}>{unit.unit_number}</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <StatusPill label={unit.status_name || unit.status} tone={unitTone(unit.status)} />
                </View>

                {!expanded ? (
                  <View style={s.collapsedRow}>
                    <Text style={s.area}>
                      <Text style={{ color: colors.muted }}>Area: </Text>
                      {unit.formatted_area || '—'}
                    </Text>
                    <View style={s.inline}>
                      <Icon name="chevron-right" size={14} color={colors.brandPrimary} />
                      <Text style={s.link}>Details</Text>
                    </View>
                  </View>
                ) : null}
              </Pressable>

              {expanded ? (
                <View style={s.detailGrid}>
                  {details.map(([label, value]) => (
                    <View key={label} style={s.detailCell}>
                      <Text style={s.detailLabel}>{label}</Text>
                      <Text style={s.detailValue}>{String(value)}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          );
        })}

        {projects.status === 'failed' && !projects.items.length ? (
          <ErrorState message={projects.error} onRetry={() => dispatch(fetchProjects({ page: 1 }))} />
        ) : null}
        {towersStatus === 'failed' ? <ErrorState message={towersError} onRetry={() => dispatch(fetchTowers(pid))} /> : null}
        {unitsStatus === 'failed' ? <ErrorState message={unitsError} onRetry={refresh} /> : null}

        {projects.status === 'loading' || towersStatus === 'loading' || categoriesStatus === 'loading' || (unitsStatus === 'loading' && !units) ? (
          <LoadingState />
        ) : null}

        {projects.status === 'succeeded' && !projects.items.length ? (
          <EmptyState icon="shopping-bag" title="No projects yet" body="Inventory will appear here once projects are added." />
        ) : null}
        {towersStatus === 'succeeded' && !towers?.length ? (
          <EmptyState icon="shopping-bag" title="No towers yet" body="This project has no inventory listed yet." />
        ) : null}
        {categoriesStatus === 'succeeded' && !categories?.length ? (
          <EmptyState icon="shopping-bag" title="No units in this tower" body="Pick another tower to see availability." />
        ) : null}
        {unitsStatus === 'succeeded' && !units?.length ? (
          <EmptyState icon="shopping-bag" title="No units" body="No units of this configuration in this tower." />
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
        {subtitle ? <Text style={s.bannerSubtitle}>{subtitle}</Text> : null}
        {meta ? <Text style={s.bannerMeta}>{meta}</Text> : null}
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
