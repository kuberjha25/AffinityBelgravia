import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { PrimaryButton } from '../components/ui';
import KeyboardDockedSheet from '../components/KeyboardDockedSheet';
import { BrandCard, SocialRow } from './LoginScreen';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { auth, images } from '../data';

/** Figma frame: `otp-verification` (12:73). */
export default function OtpScreen({ navigation, route }) {
  const mobile = route?.params?.mobile || auth.demoMobile;
  const [code, setCode] = useState(() => Array(auth.otpLength).fill(''));
  const [seconds, setSeconds] = useState(30);
  const refs = useRef([]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const filled = code.every((d) => d !== '');

  const setDigit = (index, value) => {
    const digits = value.replace(/\D/g, '');
    const next = [...code];
    if (digits.length > 1) {
      // Pasted or SMS-autofilled code: spread it across the boxes.
      digits.slice(0, auth.otpLength - index).split('').forEach((d, k) => {
        next[index + k] = d;
      });
      setCode(next);
      refs.current[Math.min(index + digits.length, auth.otpLength) - 1]?.focus();
      return;
    }
    next[index] = digits;
    setCode(next);
    if (digits && index < auth.otpLength - 1) refs.current[index + 1]?.focus();
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

      <View style={s.sheetWrap}>
        <KeyboardDockedSheet style={s.sheet} contentContainerStyle={s.sheetContent}>
          {({ onAnchorLayout }) => (
          <>
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
                maxLength={auth.otpLength}
                style={[s.otpBox, digit ? s.otpBoxFilled : null]}
                selectTextOnFocus
                autoFocus={i === 0}
                autoComplete={i === 0 ? 'sms-otp' : 'off'}
                textContentType={i === 0 ? 'oneTimeCode' : 'none'}
              />
            ))}
          </View>

          <View onLayout={onAnchorLayout} style={{ marginTop: spacing.xl }}>
            <PrimaryButton label="Verify" disabled={!filled} onPress={() => navigation.navigate('CompleteProfile')} />
          </View>

          <View style={s.resendRow}>
            <Text style={s.resendText}>Didn&apos;t receive the code? </Text>
            <Pressable disabled={seconds > 0} onPress={() => setSeconds(30)} hitSlop={8}>
              <Text style={[s.resendLink, seconds > 0 && { color: colors.muted }]}>
                {seconds > 0 ? `Resend in ${seconds}s` : 'Resend OTP'}
              </Text>
            </Pressable>
          </View>

          <SocialRow />
          </>
          )}
        </KeyboardDockedSheet>
      </View>
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
