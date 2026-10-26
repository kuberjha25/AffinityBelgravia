import React, { useCallback, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { colors, radius, spacing, type, borderWidth, shadow } from '../theme';
import { images, quickAccessPartner, quickAccessUser } from '../data';
import { imageFill } from '../components/fill';
import { imageSource } from '../format';
import { usePermissions } from '../store';
import { fetchProfile } from '../store/slices/authSlice';
import { fetchPromotions } from '../store/slices/contentSlice';
import { fetchDashboard } from '../store/slices/dashboardSlice';
import { fetchNotifications } from '../store/slices/notificationsSlice';

const { width } = Dimensions.get('window');
const H_PADDING = spacing.lg;
const BANNER_W = width - H_PADDING * 2;

/**
 * Figma frames: `home-screen` (12:450) and `User-home-screen` (12:3170).
 * The two differ only in the Quick Access tiles, so one screen serves both.
 */
export default function HomeScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { isStaff } = usePermissions();
  const user = useSelector((state) => state.auth.user);
  const stats = useSelector((state) => state.auth.stats);
  const promotions = useSelector((state) => state.content.promotions);
  const { glance: counts, glanceStatus } = useSelector((state) => state.dashboard);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Staff get the full `home-screen` tiles; CP / Broker / Influencer / Freelancer the `User-home-screen` set.
  const variant = route?.params?.variant || (isStaff ? 'partner' : 'user');
  const quickAccess = variant === 'user' ? quickAccessUser : quickAccessPartner;

  const load = useCallback(
    () =>
      Promise.all([
        dispatch(fetchProfile()),
        dispatch(fetchDashboard({ isStaff })),
        dispatch(fetchNotifications()),
        dispatch(fetchPromotions({ page: 1 })),
      ]),
    [dispatch, isStaff]
  );

  // Refresh counts each time Home is shown, so they match the lists.
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchDashboard({ isStaff }));
      dispatch(fetchNotifications());
    }, [dispatch, isStaff])
  );

  React.useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchPromotions({ page: 1 }));
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const banners = promotions.items.filter((p) => p.status !== 'inactive');
  const firstName = user?.name ? user.name.split(' ')[0] : '';
  const value = (n) => (n === null || n === undefined ? '—' : String(n));

  // #15: each count opens its list already filtered.
  const glance = [
    isStaff
      ? { id: 'g1', value: value(counts.registrationsPending), lines: ['Pending', 'Registrations'], route: 'Registrations' }
      : { id: 'g1', value: value(stats?.enquiries), lines: ['My', 'Enquiries'], route: 'Leads' },
    { id: 'g2', value: value(counts.leads), lines: ['Total', 'Leads'], route: 'Leads', params: { status: '' } },
    { id: 'g3', value: value(counts.visitsScheduled), lines: ['Visits', 'Scheduled'], route: 'Visits', params: { status: 'scheduled' } },
    { id: 'g4', value: value(stats?.bookings), lines: ['Bookings'], route: 'Leads', params: { status: 'booked' } },
  ];

  const onScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (BANNER_W + spacing.md));
    if (i !== page) setPage(i);
  };

  const go = (target, params) => {
    if (!target) return;
    navigation.navigate(target, params ? { ...params, at: Date.now() } : undefined);
  };

  return (
    <Screen
      showBack={route?.name === 'UserHome'}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {banners.length ? (
        <>
          <FlatList
            data={banners}
            keyExtractor={(b) => String(b.id)}
            horizontal
            snapToInterval={BANNER_W + spacing.md}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: H_PADDING, gap: spacing.md }}
            renderItem={({ item }) => (
              <Pressable
                style={s.banner}
                onPress={() =>
                  navigation.navigate(item.project_id ? 'ProjectDetail' : 'Projects', item.project_id ? { id: item.project_id } : undefined)
                }
              >
                <Image source={imageSource(item.image_url, images.heroInventory)} style={imageFill} resizeMode="cover" />
                <LinearGradient colors={['rgba(28,27,25,0)', 'rgba(28,27,25,0.78)']} style={StyleSheet.absoluteFill} />
                {item.tag_name ? (
                  <View style={s.bannerTag}>
                    <Text style={s.bannerTagLabel}>{item.tag_name}</Text>
                  </View>
                ) : null}
                <View style={s.bannerCopy}>
                  <Text style={s.bannerTitle} numberOfLines={2}>{item.title}</Text>
                  {item.short_description ? (
                    <Text style={s.bannerSubtitle} numberOfLines={1}>{item.short_description}</Text>
                  ) : null}
                </View>
              </Pressable>
            )}
          />
          <View style={s.dots}>
            {banners.map((b, i) => (
              <View key={b.id} style={[s.dot, i === page && s.dotActive]} />
            ))}
          </View>
        </>
      ) : promotions.status === 'loading' ? (
        <View style={[s.banner, s.bannerPlaceholder, { marginHorizontal: H_PADDING }]}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      ) : null}

      <Text style={s.welcome}>{firstName ? `Welcome, ${firstName}` : 'Welcome'}</Text>

      <Text style={s.groupLabel}>At a Glance</Text>
      <View style={s.glanceRow}>
        {glance.map((g) => (
          <Pressable key={g.id} style={s.glanceCard} onPress={() => go(g.route, g.params)}>
            {glanceStatus === 'loading' && g.value === '—' ? (
              <ActivityIndicator color={colors.brandPrimary} style={{ height: 34 }} />
            ) : (
              <Text style={s.glanceValue} numberOfLines={1} adjustsFontSizeToFit>{g.value}</Text>
            )}
            <FitLines lines={g.lines} style={s.glanceLabel} />
          </Pressable>
        ))}
      </View>

      <Text style={s.groupLabel}>Quick Access</Text>
      <View style={s.grid}>
        {quickAccess.map((q) => (
          <Pressable key={q.id} style={s.tile} onPress={() => go(q.route)}>
            <Icon name={q.icon} size={22} color={colors.brandPrimary} />
            <FitLines lines={q.label.split(' ')} style={s.tileLabel} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

/**
 * One Text per line, each shrinking to fit its own width, so a label like
 * "Registrations" scales down on narrow screens / large system fonts instead
 * of breaking mid-word ("Registrati-ons").
 */
function FitLines({ lines, style }) {
  return (
    <View style={{ alignSelf: 'stretch' }}>
      {lines.map((line) => (
        <Text
          key={line}
          style={style}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          maxFontSizeMultiplier={1.3}
        >
          {line}
        </Text>
      ))}
    </View>
  );
}

const TILE_GAP = spacing.sm;
const TILE_W = Math.floor((width - H_PADDING * 2 - TILE_GAP * 3) / 4);

const s = StyleSheet.create({
  banner: {
    width: BANNER_W,
    height: 160,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bannerPlaceholder: { backgroundColor: colors.surfaceTertiary, alignItems: 'center', justifyContent: 'center' },
  bannerCopy: { padding: spacing.lg },
  bannerTitle: { ...type.heading, color: colors.onSurfaceInverse },
  bannerSubtitle: { ...type.bodySmall, color: 'rgba(255,255,255,0.86)', marginTop: 2 },
  bannerTag: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    height: 22,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.brandPrimary,
    justifyContent: 'center',
  },
  bannerTagLabel: { ...type.caption, color: colors.onBrand, letterSpacing: 1 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { width: 18, backgroundColor: colors.brandPrimary },

  welcome: {
    ...type.heading,
    color: colors.onSurface,
    paddingHorizontal: H_PADDING,
    marginTop: spacing.lg,
  },
  groupLabel: {
    ...type.bodySmall,
    color: colors.muted,
    paddingHorizontal: H_PADDING,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  glanceRow: { flexDirection: 'row', gap: TILE_GAP, paddingHorizontal: H_PADDING },
  glanceCard: {
    flex: 1,
    minHeight: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  glanceValue: { ...type.title, color: colors.brandPrimary, textAlign: 'center' },
  glanceLabel: { ...type.caption, fontSize: 11, lineHeight: 15, color: colors.muted, textAlign: 'center' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
    paddingHorizontal: H_PADDING,
  },
  tile: {
    width: TILE_W,
    minHeight: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadow.card,
  },
  tileLabel: { ...type.caption, fontSize: 12, lineHeight: 16, color: colors.onSurface, textAlign: 'center' },
});
