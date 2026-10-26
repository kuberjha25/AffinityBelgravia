import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { colors, spacing, type } from '../theme';
import { brand, images } from '../data';
import { bootstrapSession } from '../store/slices/authSlice';

const MIN_SPLASH_MS = 1500;

/** Figma frame: `splash-light` (12:2). Restores a saved session, else goes to Login. */
export default function SplashScreen({ navigation }) {
  const dispatch = useDispatch();
  const fade = React.useRef(new Animated.Value(0)).current;
  const rise = React.useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    let cancelled = false;
    const wait = new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_MS));
    Promise.all([dispatch(bootstrapSession()), wait]).then(([action]) => {
      if (cancelled) return;
      const signedIn = Boolean(action.payload?.token);
      navigation.reset({ index: 0, routes: [{ name: signedIn ? 'Main' : 'Login' }] });
    });
    return () => {
      cancelled = true;
    };
  }, [fade, rise, navigation, dispatch]);

  return (
    <View style={s.root}>
      {/* background-architecture + gradient-overlay + background-bottom-fade */}
      <LinearGradient
        colors={['rgba(177,151,119,0.10)', 'rgba(251,249,245,0)']}
        style={s.topWash}
      />
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Animated.View style={{ opacity: fade, transform: [{ translateY: rise }], alignItems: 'center' }}>
            <Image source={images.logoHi} style={s.mark} resizeMode="contain" />
            <Text style={s.affinity}>{brand.name.toUpperCase().split('').join(' ')}</Text>
            <Text style={s.belgravia}>{brand.subName.toUpperCase()}</Text>
          </Animated.View>
        </View>

        <Animated.View style={[s.bottom, { opacity: fade }]}>
          <Text style={s.tagline}>{brand.tagline[0]}</Text>
          <Text style={s.tagline}>{brand.tagline[1]}</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  topWash: { position: 'absolute', top: 0, left: 0, right: 0, height: 437 },
  safe: { flex: 1, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 96, height: 130 },
  affinity: {
    ...type.wordmark,
    color: colors.onSurface,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  belgravia: {
    ...type.display,
    letterSpacing: 2,
    color: colors.onSurface,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  bottom: { paddingBottom: spacing.xxl, alignItems: 'center' },
  tagline: { ...type.bodySmall, color: colors.onSurfaceTertiary, textAlign: 'center' },
});
