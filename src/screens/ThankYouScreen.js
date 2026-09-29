import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SuccessState } from '../components/ui';
import { colors, spacing, type } from '../theme';
import { brand, images, thankYou } from '../data';

/** Figma frame: `thank-you-screen` (12:416). */
export default function ThankYouScreen({ navigation }) {
  return (
    <SafeAreaView style={s.root}>
      <View style={s.center}>
        <Image source={images.logoHi} style={s.mark} resizeMode="contain" />
        <Text style={s.affinity}>{brand.name.toUpperCase().split('').join(' ')}</Text>
        <Text style={s.belgravia}>{brand.subName.toUpperCase()}</Text>

        <SuccessState
          title={thankYou.title}
          body={thankYou.body}
          note={thankYou.note}
          primaryLabel={thankYou.cta}
          onPrimary={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
          secondaryLabel={thankYou.secondary}
          onSecondary={() => navigation.navigate('About')}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  mark: { width: 80, height: 108 },
  affinity: { ...type.wordmark, color: colors.onSurface, marginTop: spacing.lg },
  belgravia: { ...type.title, letterSpacing: 1.5, color: colors.onSurface, marginTop: 2, marginBottom: spacing.xl },
});
