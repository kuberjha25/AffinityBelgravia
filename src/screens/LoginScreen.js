import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Icon from '../components/Icon';
import { PrimaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth, shadow } from '../theme';
import { auth, brand, images, socialLinks } from '../data';
import { useApp } from '../store';

/** Figma frame: `login-register` (12:25). */
export default function LoginScreen({ navigation }) {
  const { patchOnboarding } = useApp();
  const [mobile, setMobile] = useState('');
  const valid = mobile.replace(/\D/g, '').length === 10;

  const onContinue = () => {
    patchOnboarding({ mobile });
    navigation.navigate('Otp', { mobile });
  };

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <Image source={images.heroLogin} style={s.hero} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(28,27,25,0.35)', 'rgba(28,27,25,0)']}
        style={[s.hero, { height: 180 }]}
      />

      <BrandCard />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.sheetWrap}
      >
        <ScrollView
          style={s.sheet}
          contentContainerStyle={s.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.welcome}>Welcome</Text>
          <Text style={s.lead}>Enter your mobile number to login or register</Text>

          <View style={s.phoneRow}>
            <Pressable style={s.dial}>
              <Text style={s.flag}>{auth.flag}</Text>
              <Text style={s.dialCode}>{auth.dialCode}</Text>
              <Icon name="chevron-down" size={14} color={colors.muted} />
            </Pressable>
            <View style={s.phoneDivider} />
            <TextInput
              style={s.phoneInput}
              value={mobile}
              onChangeText={(t) => setMobile(t.replace(/[^0-9 ]/g, ''))}
              placeholder="Enter mobile number"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={12}
            />
          </View>

          <PrimaryButton
            label="Continue"
            onPress={onContinue}
            disabled={!valid}
            style={{ marginTop: spacing.xl }}
          />

          <Text style={s.legal}>
            By continuing, you agree to our{' '}
            <Text style={s.legalLink} onPress={() => navigation.navigate('Terms')}>
              Terms of Service
            </Text>{' '}
            and{'\n'}
            <Text style={s.legalLink} onPress={() => navigation.navigate('Terms')}>
              Privacy Policy
            </Text>
          </Text>

          <SocialRow />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export function BrandCard({ style }) {
  return (
    <View style={[s.brandCard, style]}>
      <Image source={images.logo} style={s.brandMark} resizeMode="contain" />
      <Text style={s.brandAffinity}>{brand.name.toUpperCase().split('').join(' ')}</Text>
      <Text style={s.brandBelgravia}>{brand.subName.toUpperCase()}</Text>
    </View>
  );
}

export function SocialRow({ style }) {
  return (
    <View style={[s.socialRow, style]}>
      {socialLinks.map((link) => (
        <Pressable key={link.id} style={s.socialBtn}>
          <Icon name={link.icon} size={18} color={colors.brandPrimary} />
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  hero: { position: 'absolute', top: 0, left: 0, width: '100%', height: 360 },

  brandCard: {
    position: 'absolute',
    top: 52,
    left: 30,
    right: 30,
    backgroundColor: colors.glassFill,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    ...shadow.card,
  },
  brandMark: { width: 28, height: 38 },
  brandAffinity: { ...type.wordmark, color: colors.onSurface, marginTop: spacing.md },
  brandBelgravia: { ...type.pageTitle, letterSpacing: 1.5, color: colors.onSurface, marginTop: 2 },

  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '64%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetContent: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },

  welcome: { ...type.display, color: colors.onSurface },
  lead: { ...type.body, color: colors.muted, marginTop: spacing.sm },

  phoneRow: {
    marginTop: spacing.xl,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  dial: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flag: { fontSize: 18 },
  dialCode: { ...type.body, color: colors.onSurface },
  phoneDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  phoneInput: { flex: 1, ...type.body, color: colors.onSurface, padding: 0 },

  legal: {
    ...type.caption,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
  legalLink: { color: colors.brandPrimary },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
