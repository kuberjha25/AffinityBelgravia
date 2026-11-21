import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { TextField } from './ui';
import { colors, spacing, type } from '../theme';
import { digits } from '../format';
import { lookupPincode } from '../api';

const norm = (v) => String(v || '').toLowerCase().replace(/[^a-z]/g, '');

/**
 * India Post files some cities under another district name (most Mohali PINs
 * are still under Rupnagar, which Mohali was carved out of). Names in one
 * group count as the same city.
 */
const CITY_GROUPS = [
  ['mohali', 'sasnagar', 'sahibzadaajitsinghnagar', 'mohalisasnagar', 'rupnagar', 'ropar'],
  ['shahidbhagatsinghnagar', 'sbsnagar', 'nawanshahr'],
  ['gurugram', 'gurgaon'],
  ['bengaluru', 'bangalore', 'bengaluruurban', 'bangaloreurban'],
  ['mumbai', 'mumbaicity', 'mumbaisuburban'],
];

const sameName = (a, b) => {
  const x = norm(a);
  const y = norm(b);
  return Boolean(x && y) && (x === y || x.includes(y) || y.includes(x));
};
const sameCity = (city, district) =>
  sameName(city, district) ||
  CITY_GROUPS.some((g) => g.includes(norm(city)) && g.includes(norm(district)));

/**
 * Checks a PIN code against India Post and against the chosen state / city
 * (as on Meraqui). When state and city are still empty they are filled from
 * the PIN code via `onAutofill({ state, city })`.
 * → `{ loading, verified, error, suggestion }`; `error` blocks Continue.
 */
export function usePincodeCheck(pincode, state, city, onAutofill) {
  const [result, setResult] = useState({ pin: '', place: null, loading: false });
  const autofill = useRef(onAutofill);
  autofill.current = onAutofill;

  useEffect(() => {
    if ((pincode || '').length !== 6) {
      setResult({ pin: '', place: null, loading: false });
      return undefined;
    }
    let cancelled = false;
    setResult({ pin: pincode, place: null, loading: true });
    lookupPincode(pincode).then((place) => {
      if (cancelled) return;
      setResult({ pin: pincode, place, loading: false });
      if (place?.found) autofill.current?.(place);
    });
    return () => {
      cancelled = true;
    };
  }, [pincode]);

  const pin = pincode || '';
  if (!pin) return { loading: false, verified: false, error: null, suggestion: null };
  if (pin.length !== 6) return { loading: false, verified: false, error: 'Enter a valid 6-digit PIN code', suggestion: null };
  if (result.pin !== pin || result.loading) return { loading: true, verified: false, error: null, suggestion: null };

  const place = result.place;
  // Lookup service unreachable: don't block the partner over it.
  if (!place) return { loading: false, verified: false, error: null, suggestion: null };
  if (!place.found) return { loading: false, verified: false, error: 'This PIN code was not found. Please check it.', suggestion: null };

  const stateOk = !state || sameName(state, place.state);
  const cityOk = !city || place.districts.some((d) => sameCity(city, d));
  if (stateOk && cityOk) return { loading: false, verified: true, error: null, suggestion: null };

  return {
    loading: false,
    verified: false,
    error: `This PIN code belongs to ${place.city}, ${place.state} — not ${city || 'the selected city'}${state ? `, ${state}` : ''}.`,
    suggestion: { state: place.state, city: place.city },
  };
}

/** PIN code input with the Meraqui-style status line underneath. */
export default function PinCodeField({ value, onChangeText, check, onUseSuggestion, placeholder = 'PIN Code' }) {
  return (
    <View style={{ alignSelf: 'stretch' }}>
      <TextField
        icon="map-pin"
        placeholder={placeholder}
        value={value}
        onChangeText={(v) => onChangeText(digits(v, 6))}
        keyboardType="number-pad"
        maxLength={6}
        error={check.error || undefined}
      />
      {check.loading ? (
        <View style={s.status}>
          <ActivityIndicator size="small" color={colors.brandPrimary} />
          <Text style={[s.statusText, { color: colors.muted }]}>Verifying PIN code…</Text>
        </View>
      ) : null}
      {check.verified ? (
        <View style={s.status}>
          <Icon name="circle-check" size={14} color={colors.success} />
          <Text style={[s.statusText, { color: colors.success }]}>PIN code verified</Text>
        </View>
      ) : null}
      {check.suggestion ? (
        <Pressable onPress={() => onUseSuggestion(check.suggestion)} hitSlop={6} style={s.status}>
          <Icon name="map-pin" size={14} color={colors.brandPrimary} />
          <Text style={[s.statusText, { color: colors.brandPrimary, fontWeight: '600' }]}>
            {`Use ${check.suggestion.city}, ${check.suggestion.state} instead`}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
  statusText: { ...type.caption },
});
