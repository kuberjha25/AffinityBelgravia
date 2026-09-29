import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from './Icon';
import { RoundIconButton } from './ui';
import { colors, spacing, type } from '../theme';
import { images } from '../data';
import { useApp } from '../store';

/**
 * App bar — Figma component "App Bar" (State=Default / State=Notification).
 * Brand monogram at the left, optional back chevron, bell with unread dot.
 */
export function AppBar({ showBack, onBack, right, style }) {
  const navigation = useNavigation();
  const { unreadCount } = useApp();
  const back = onBack || (() => navigation.goBack());

  return (
    <View style={[s.appBar, style]}>
      {showBack ? (
        <Pressable onPress={back} hitSlop={12} style={{ marginRight: spacing.md }}>
          <Icon name="chevron-left" size={20} color={colors.onSurface} />
        </Pressable>
      ) : null}
      <Image source={images.logo} style={s.logo} resizeMode="contain" />
      <View style={{ flex: 1 }} />
      {right !== undefined ? (
        right
      ) : (
        <RoundIconButton
          name="bell"
          size={40}
          iconSize={18}
          badge={unreadCount > 0}
          onPress={() => navigation.navigate('Notifications')}
        />
      )}
    </View>
  );
}

export function PageTitle({ children, subtitle, right, style }) {
  return (
    <View style={[s.titleRow, style]}>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{children}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

/**
 * Standard screen shell: safe-area background, app bar, scrolling body.
 */
export default function Screen({
  children,
  showAppBar = true,
  showBack = false,
  onBack,
  appBarRight,
  scroll = true,
  contentContainerStyle,
  style,
  footer,
  edges = ['top'],
  backgroundColor = colors.surface,
}) {
  const insets = useSafeAreaInsets();
  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: [
          { paddingBottom: footer ? spacing.lg : insets.bottom + spacing.xxl },
          contentContainerStyle,
        ],
        keyboardShouldPersistTaps: 'handled',
      }
    : { style: [{ flex: 1 }, contentContainerStyle] };

  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor }, style]}>
      {showAppBar ? <AppBar showBack={showBack} onBack={onBack} right={appBarRight} /> : null}
      <Body {...bodyProps}>{children}</Body>
      {footer}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  appBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: { width: 34, height: 44 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  title: { ...type.pageTitle, color: colors.onSurface },
  subtitle: { ...type.bodySmall, color: colors.muted, marginTop: spacing.xs },
});

export const screenStyles = s;
