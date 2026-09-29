import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from './Icon';
import KeyboardActionBar, { ACTION_BAR_HEIGHT } from './KeyboardActionBar';
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

/** Gap between a focused input's bottom edge and the top of the keyboard. */
export const KEYBOARD_GAP = 0;

/**
 * Standard screen shell: safe-area background, app bar, scrolling body.
 * `keyboardAction` is shown on top of the keyboard while the user is typing.
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
  keyboardAction,
  edges = ['top'],
  backgroundColor = colors.surface,
}) {
  const insets = useSafeAreaInsets();
  const Body = scroll ? KeyboardAwareScrollView : View;
  const bodyProps = scroll
    ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: [
          { paddingBottom: footer ? spacing.lg : insets.bottom + spacing.xxl },
          contentContainerStyle,
        ],
        keyboardShouldPersistTaps: 'handled',
        bottomOffset: keyboardAction ? ACTION_BAR_HEIGHT : KEYBOARD_GAP,
      }
    : { style: [{ flex: 1 }, contentContainerStyle] };

  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor }, style]}>
      {showAppBar ? <AppBar showBack={showBack} onBack={onBack} right={appBarRight} /> : null}
      <Body {...bodyProps}>{children}</Body>
      {footer}
      {keyboardAction ? <KeyboardActionBar>{keyboardAction}</KeyboardActionBar> : null}
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
