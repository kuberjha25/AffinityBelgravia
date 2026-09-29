import React, { useEffect, useRef, useState } from 'react';
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
import { PrimaryButton } from '../components/ui';
import { BrandCard, SocialRow } from './LoginScreen';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { auth, images } from '../data';

/** Figma frame: `otp-verification` (12:73). */
export default function OtpScreen({ navigation, route }) {
  const mobile = route?.params?.mobile || auth.demoMobile;
  const [code, setCode] = useState(['4', '8', '2', '', '', '']);
  const [seconds, setSeconds] = useState(30);
  const refs = useRef([]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const filled = code.every((d) => d !== '');

  const setDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) refs.current[index + 1]?.focus();
  };

  const onKeyPress = (index, e) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      refs.current[index - 1]?.focus();
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <Image source={images.heroLogin} style={s.hero} resizeMode="cover" />
      <LinearGradient colors={['rgba(28,27,25,0.35)', 'rgba(28,27,25,0)']} style={[s.hero, { height: 180 }]} />
      <BrandCard />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.sheetWrap}>
        <ScrollView
          style={s.sheet}
          contentContainerStyle={s.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.title}>Verify OTP</Text>
          <Text style={s.lead}>
            Enter the {auth.otpLength}-digit code sent to{' '}
            <Text style={s.leadStrong}>{`${auth.dialCode} ${mobile}`}</Text>
          </Text>

          <View style={s.otpRow}>
            {code.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={digit}
                onChangeText={(v) => setDigit(i, v)}
                onKeyPress={(e) => onKeyPress(i, e)}
                keyboardType="number-pad"
                maxLength={1}
                style={[s.otpBox, digit ? s.otpBoxFilled : null]}
                selectTextOnFocus
              />
            ))}
          </View>

          <PrimaryButton
            label="Verify"
            disabled={!filled}
            onPress={() => navigation.navigate('CompleteProfile')}
            style={{ marginTop: spacing.xl }}
          />

          <View style={s.resendRow}>
            <Text style={s.resendText}>Didn&apos;t receive the code? </Text>
            <Pressable disabled={seconds > 0} onPress={() => setSeconds(30)} hitSlop={8}>
              <Text style={[s.resendLink, seconds > 0 && { color: colors.muted }]}>
                {seconds > 0 ? `Resend in ${seconds}s` : 'Resend OTP'}
              </Text>
            </Pressable>
          </View>

          <SocialRow />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  hero: { position: 'absolute', top: 0, left: 0, width: '100%', height: 360 },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '64%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetContent: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxxl },

  title: { ...type.display, color: colors.onSurface },
  lead: { ...type.bodySmall, color: colors.muted, marginTop: spacing.sm },
  leadStrong: { ...type.bodySmall, color: colors.onSurface },

  otpRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    textAlign: 'center',
    ...type.heading,
    color: colors.onSurface,
  },
  otpBoxFilled: { borderColor: colors.brandPrimary, borderWidth: borderWidth.selected },

  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  resendText: { ...type.bodySmall, color: colors.muted },
  resendLink: { ...type.bodySmall, color: colors.brandPrimary },
});
