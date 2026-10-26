import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { Card, PrimaryButton, SecondaryButton, LoadingState, ErrorState, EmptyState } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { images } from '../data';
import { imageFill } from '../components/fill';
import { humanize, imageSource, orDash, plainParagraphs } from '../format';
import { fetchProject, fetchProjects } from '../store/slices/projectsSlice';

/** Icon for an amenity name; the backend sends plain strings. */
const AMENITY_ICONS = [
  [/pool|swim/i, 'glass-water'],
  [/gym|fitness/i, 'dumbbell'],
  [/club/i, 'home'],
  [/parking|car\b/i, 'car'],
  [/garden|park|green|landscape/i, 'leaf'],
  [/security|cctv|guard|safe/i, 'shield'],
  [/play|kids|game/i, 'gamepad'],
];
const amenityIcon = (name) => AMENITY_ICONS.find(([re]) => re.test(name))?.[1] || 'circle-check';

/**
 * Figma frame: `project-detail-screen` (12:1440).
 * Opened with `{ id }`; without one (Home banner) it shows the first project.
 */
export default function ProjectDetailScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.projects.list);
  const id = route?.params?.id ?? list.items[0]?.id;
  const project = useSelector((state) => (id ? state.projects.details[id] : null));
  const status = useSelector((state) => (id ? state.projects.detailsStatus[id] : null));
  const error = useSelector((state) => (id ? state.projects.detailsError[id] : null));
  const [config, setConfig] = useState(0);

  useEffect(() => {
    if (!route?.params?.id && list.status === 'idle') dispatch(fetchProjects({ page: 1 }));
  }, [dispatch, route?.params?.id, list.status]);

  useEffect(() => {
    if (id) dispatch(fetchProject(id));
  }, [dispatch, id]);

  if (!project) {
    const noProjects = !id && list.status === 'succeeded';
    return (
      <Screen showBack>
        {noProjects ? (
          <EmptyState icon="layers" title="No projects yet" body="Projects will appear here once added." />
        ) : status === 'failed' || (!id && list.status === 'failed') ? (
          <ErrorState message={error || list.error} onRetry={() => (id ? dispatch(fetchProject(id)) : dispatch(fetchProjects({ page: 1 })))} />
        ) : (
          <LoadingState />
        )}
      </Screen>
    );
  }

  const pricing = project.configuration_pricing || [];
  const amenities = project.amenities || [];
  const highlights = project.highlights || [];
  const overview = plainParagraphs(project.description || project.short_description);
  const facts = [
    ['RERA No', project.rera_number],
    ['Project Type', project.type ? humanize(project.type) : null],
    ['Possession', project.possession_date],
    ['Launch Year', project.launch_year],
    ['Total Towers', project.towers_count],
    ['Address', [project.address, project.city, project.state, project.pincode].filter(Boolean).join(', ')],
  ].filter(([, v]) => v !== null && v !== undefined && v !== '');

  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }} onRefresh={() => dispatch(fetchProject(id))}>
      <View style={s.hero}>
        <Image source={imageSource(project.image_url, images.heroProject)} style={imageFill} resizeMode="cover" />
        <LinearGradient colors={['rgba(28,27,25,0.1)', 'rgba(28,27,25,0.75)']} style={StyleSheet.absoluteFill} />
        <View style={s.heroCopy}>
          <Text style={s.heroTitle}>{String(project.name || '').toUpperCase()}</Text>
          <View style={s.inline}>
            <Icon name="map-pin" size={14} color={colors.brandTertiary} />
            <Text style={s.heroLocation}>{[project.city, project.state].filter(Boolean).join(', ')}</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginTop: -28 }}>
        <Card style={s.statsCard}>
          <Stat label="Total Units" value={orDash(project.units_count)} />
          <View style={s.statDivider} />
          <Stat label="Towers" value={orDash(project.towers_count)} />
          <View style={s.statDivider} />
          <Stat label="Status" value={project.status ? humanize(project.status) : '—'} highlight compact />
        </Card>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg }}>
        <Card>
          <Text style={s.cardTitle}>Project Overview</Text>
          {overview.map((p, i) => (
            <Text key={i} style={s.overview}>{p}</Text>
          ))}
          <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
            {facts.map(([label, value]) => (
              <View key={label}>
                <Text style={s.factLabel}>{label}</Text>
                <Text style={s.factValue}>{String(value)}</Text>
              </View>
            ))}
          </View>
        </Card>

        {pricing.length ? <Text style={s.sectionTitle}>Unit Configurations</Text> : null}
      </View>

      {pricing.length ? (
        <View style={s.configRow}>
          {pricing.map((c, i) => {
            const active = config === i;
            return (
              <Pressable key={`${c.category}-${i}`} onPress={() => setConfig(i)} style={[s.configCard, active && s.configCardActive]}>
                <Text style={s.configTitle}>{c.category}</Text>
                <Text style={s.configArea} numberOfLines={1} adjustsFontSizeToFit>
                  {c.area ? `${Number(c.area)} ${c.area_unit || ''}`.trim() : '—'}
                </Text>
                <Text style={s.configPrice} numberOfLines={2} adjustsFontSizeToFit>{c.formatted_price || '—'}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg }}>
        <PrimaryButton label="View Inventory" onPress={() => navigation.navigate('Inventory', { projectId: project.id })} />

        {highlights.length ? (
          <Card style={{ gap: spacing.md }}>
            <Text style={s.cardTitle}>Highlights</Text>
            {highlights.map((h, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Icon name="circle-check" size={16} color={colors.brandPrimary} />
                <Text style={[s.factValue, { flex: 1, marginTop: 0 }]}>{typeof h === 'string' ? h : h.title || ''}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        {amenities.length ? (
          <>
            <Text style={s.sectionTitle}>Amenities</Text>
            <Card>
              <View style={s.amenityGrid}>
                {amenities.map((a, i) => {
                  const name = typeof a === 'string' ? a : a?.name || '';
                  return (
                    <View key={`${name}-${i}`} style={s.amenity}>
                      <View style={s.amenityIcon}>
                        <Icon name={amenityIcon(name)} size={20} color={colors.brandPrimary} />
                      </View>
                      <Text style={s.amenityLabel} numberOfLines={2}>{name}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          </>
        ) : null}

        {project.brochure_url ? (
          <SecondaryButton label="Download Brochure" icon="download" onPress={() => Linking.openURL(project.brochure_url)} />
        ) : null}
        <SecondaryButton label="Documents" icon="file-text" onPress={() => navigation.navigate('Documents', { projectId: project.id })} />

        {project.contact_name || project.contact_phone || project.contact_email ? (
          <Card style={{ gap: spacing.sm }}>
            <Text style={s.cardTitle}>Sales Contact</Text>
            {project.contact_name ? <Text style={s.factValue}>{project.contact_name}</Text> : null}
            {project.contact_phone ? (
              <Text style={s.link} onPress={() => Linking.openURL(`tel:${project.contact_phone}`)}>{project.contact_phone}</Text>
            ) : null}
            {project.contact_email ? (
              <Text style={s.link} onPress={() => Linking.openURL(`mailto:${project.contact_email}`)}>{project.contact_email}</Text>
            ) : null}
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

function Stat({ label, value, highlight, compact }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4 }}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, compact && s.statValueCompact, highlight && { color: colors.brandPrimary }]} numberOfLines={1}>
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
  link: { ...type.body, color: colors.brandPrimary },

  sectionTitle: { ...type.heading, color: colors.onSurface },

  configRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  configCard: {
    flexGrow: 1,
    flexBasis: '30%',
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  configCardActive: { borderColor: colors.brandPrimary, borderWidth: borderWidth.selected },
  configTitle: { ...type.body, color: colors.onSurface },
  configArea: { ...type.caption, color: colors.muted, marginTop: spacing.sm },
  configPrice: { ...type.bodySmall, color: colors.brandPrimary, marginTop: spacing.sm },

  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  amenity: { width: '25%', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: 2 },
  amenityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: { ...type.caption, color: colors.onSurfaceTertiary, marginTop: spacing.sm, textAlign: 'center' },
});
