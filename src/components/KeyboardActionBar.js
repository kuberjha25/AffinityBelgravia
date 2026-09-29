import React from 'react';
import { StyleSheet } from 'react-native';
import Reanimated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { colors, spacing, borderWidth } from '../theme';

/** Height of the bar: 56 px button + vertical padding. */
export const ACTION_BAR_HEIGHT = 56 + spacing.md * 2;

/**
 * Keeps a form's primary action reachable while typing. Hidden below the
 * screen while the keyboard is closed (the form's own inline button is used
 * then), and rides up on top of the keyboard as it opens.
 *
 * Render as the last child of the screen root; pair it with
 * `bottomOffset={ACTION_BAR_HEIGHT}` on the scroll view so the focused input
 * sits just above the bar.
 */
export default function KeyboardActionBar({ children }) {
  const { height, progress } = useReanimatedKeyboardAnimation();

  const animatedStyle = useAnimatedStyle(() => {
    // Parked just off-screen while closed; keyboard height is negative while open.
    const parked = interpolate(progress.value, [0, 1], [ACTION_BAR_HEIGHT + spacing.xl, 0]);
    return { transform: [{ translateY: height.value + parked }] };
  });

  return <Reanimated.View style={[s.bar, animatedStyle]}>{children}</Reanimated.View>;
}

const s = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: ACTION_BAR_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: borderWidth.default,
    borderTopColor: colors.border,
  },
});
