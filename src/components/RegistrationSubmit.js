import React, { useState } from 'react';
import { Alert, Text, Pressable, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { CenterDialog, PrimaryButton, TextField } from './ui';
import { colors, type } from '../theme';
import { digits } from '../format';
import {
  submitRegistration,
  verifyRegistrantOtp,
  resendRegistrantOtp,
} from '../store/slices/registrationsSlice';

/**
 * Submits the registration wizard.
 * - Self-registration: the partner is signed in and lands on Thank You.
 * - Staff registration: the partner's mobile gets an OTP, entered here, then
 *   back to the Registrations list.
 * Returns `{ submit, submitting, dialog }`; render `dialog` in the screen.
 */
export function useRegistrationSubmit(navigation) {
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [otpFor, setOtpFor] = useState(null);

  const submit = async () => {
    setSubmitting(true);
    try {
      const result = await dispatch(submitRegistration()).unwrap();
      if (result.mode === 'self') {
        navigation.reset({ index: 0, routes: [{ name: 'ThankYou' }] });
      } else if (result.requiresOtp) {
        setOtpFor(result.mobile);
      } else {
        done();
      }
    } catch (message) {
      Alert.alert('Could not submit', String(message));
    } finally {
      setSubmitting(false);
    }
  };

  const done = () => {
    setOtpFor(null);
    Alert.alert('Partner registered', 'The registration has been saved.', [
      { text: 'OK', onPress: () => navigation.navigate('Registrations') },
    ]);
  };

  const dialog = (
    <RegistrantOtpDialog mobile={otpFor} onClose={() => setOtpFor(null)} onVerified={done} dispatch={dispatch} />
  );

  return { submit, submitting, dialog };
}

function RegistrantOtpDialog({ mobile, onClose, onVerified, dispatch }) {
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);

  const verify = async () => {
    setBusy(true);
    try {
      await dispatch(verifyRegistrantOtp({ mobile, otp })).unwrap();
      setOtp('');
      onVerified();
    } catch (message) {
      Alert.alert('Verification failed', String(message));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      const message = await dispatch(resendRegistrantOtp(mobile)).unwrap();
      Alert.alert('OTP sent', message);
    } catch (message) {
      Alert.alert('Could not resend OTP', String(message));
    }
  };

  return (
    <CenterDialog visible={Boolean(mobile)} onClose={onClose} title="Verify Partner Mobile">
      <Text style={s.body}>{`Enter the OTP sent to the partner's mobile ${mobile || ''}.`}</Text>
      <TextField
        icon="hash"
        placeholder="Enter OTP"
        value={otp}
        onChangeText={(v) => setOtp(digits(v, 6))}
        keyboardType="number-pad"
        maxLength={6}
      />
      <PrimaryButton label="Verify" onPress={verify} loading={busy} disabled={otp.length < 4} />
      <Pressable onPress={resend} hitSlop={8} style={{ alignSelf: 'center' }}>
        <Text style={s.link}>Resend OTP</Text>
      </Pressable>
    </CenterDialog>
  );
}

const s = StyleSheet.create({
  body: { ...type.bodySmall, color: colors.muted },
  link: { ...type.bodySmall, color: colors.brandPrimary },
});
