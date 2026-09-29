import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Reanimated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { KEYBOARD_GAP } from './Screen';

/**
 * Bottom sheet that rides up with the keyboard so the bottom edge of its
 * anchor (the form's action button) sits on top of the keyboard. Content below the
 * anchor slides behind the keyboard while it is open.
 *
 * Render the anchor as a direct child and pass `onLayout={onAnchorLayout}`
 * from the render-prop argument.
 */
export default function KeyboardDockedSheet({ style, contentContainerStyle, children }) {
  const { height } = useReanimatedKeyboardAnimation();
  const sheetHeight = useSharedValue(0);
  const anchorBottom = useSharedValue(0);

  const onAnchorLayout = useCallback(
    (e) => {
      const { y, height: h } = e.nativeEvent.layout;
      anchorBottom.value = y + h;
    },
    [anchorBottom],
  );

  const animatedStyle = useAnimatedStyle(() => {
    // Keyboard height is reported as a negative value while it is open.
    const below = sheetHeight.value - anchorBottom.value - KEYBOARD_GAP;
    return { transform: [{ translateY: Math.min(0, height.value + below) }] };
  });

  return (
    <Reanimated.View
      style={[s.wrap, style, animatedStyle]}
      onLayout={(e) => {
        sheetHeight.value = e.nativeEvent.layout.height;
      }}
    >
      <ScrollView
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children({ onAnchorLayout })}
      </ScrollView>
    </Reanimated.View>
  );
}

const s = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
