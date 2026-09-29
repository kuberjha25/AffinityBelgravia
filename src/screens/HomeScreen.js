import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { colors, radius, spacing, type, borderWidth, shadow } from '../theme';
import { homeBanners, homeGlance, quickAccessPartner, quickAccessUser, currentUser } from '../data';
import { useApp } from '../store';
import { imageFill } from '../components/fill';

const { width } = Dimensions.get('window');
const H_PADDING = spacing.lg;
const BANNER_W = width - H_PADDING * 2;

/**
 * Figma frames: `home-screen` (12:450) and `User-home-screen` (12:3170).
 * The two differ only in the Quick Access tiles, so one screen serves both.
 */
export default function HomeScreen({ navigation, route }) {
  const variant = route?.params?.variant || 'partner';
  const quickAccess = variant === 'user' ? quickAccessUser : quickAccessPartner;
  const { profile } = useApp();
  const [page, setPage] = useState(0);
  const listRef = useRef(null);

  const onScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (BANNER_W + spacing.md));
    if (i !== page) setPage(i);
  };

  const go = (target) => {
    if (!target) return;
    navigation.navigate(target);
  };

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <FlatList
        ref={listRef}
        data={homeBanners}
        keyExtractor={(b) => b.id}
        horizontal
        pagingEnabled={false}
        snapToInterval={BANNER_W + spacing.md}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: H_PADDING, gap: spacing.md }}
        renderItem={({ item }) => (
          <Pressable style={s.banner} onPress={() => navigation.navigate('ProjectDetail')}>
            <Image source={item.image} style={imageFill} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(28,27,25,0)', 'rgba(28,27,25,0.78)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.bannerCopy}>
              <Text style={s.bannerTitle}>{item.title}</Text>
              <Text style={s.bannerSubtitle}>{item.subtitle}</Text>
            </View>
          </Pressable>
        )}
      />

      <View style={s.dots}>
        {homeBanners.map((b, i) => (
          <View key={b.id} style={[s.dot, i === page && s.dotActive]} />
        ))}
      </View>

      <Text style={s.welcome}>{`Welcome, ${profile.firstName || currentUser.firstName}`}</Text>

      <Text style={s.groupLabel}>At a Glance</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: H_PADDING, gap: spacing.md }}
      >
        {homeGlance.map((g) => (
          <Pressable key={g.id} style={s.glanceCard} onPress={() => go(g.route)}>
            <Text style={s.glanceValue}>{g.value}</Text>
            <Text style={s.glanceLabel}>{g.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={s.groupLabel}>Quick Access</Text>
      <View style={s.grid}>
        {quickAccess.map((q) => (
          <Pressable key={q.id} style={s.tile} onPress={() => go(q.route)}>
            <Icon name={q.icon} size={22} color={colors.brandPrimary} />
            <Text style={s.tileLabel} numberOfLines={2}>{q.label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const TILE_W = (width - H_PADDING * 2 - spacing.md * 3) / 4;

const s = StyleSheet.create({
  banner: {
    width: BANNER_W,
    height: 160,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bannerCopy: { padding: spacing.lg },
  bannerTitle: { ...type.heading, color: colors.onSurfaceInverse },
  bannerSubtitle: { ...type.bodySmall, color: 'rgba(255,255,255,0.86)', marginTop: 2 },

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

  glanceCard: {
    width: 92,
    height: 94,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'space-between',
    ...shadow.card,
  },
  glanceValue: { ...type.title, color: colors.brandPrimary },
  glanceLabel: { ...type.caption, color: colors.onSurfaceTertiary },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: H_PADDING,
  },
  tile: {
    width: TILE_W,
    height: 84,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    padding: spacing.sm + 2,
    justifyContent: 'space-between',
    ...shadow.card,
  },
  tileLabel: { ...type.caption, fontSize: 11, lineHeight: 14, color: colors.onSurface },
});
