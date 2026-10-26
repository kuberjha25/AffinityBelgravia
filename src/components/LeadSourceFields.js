import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { SelectField, TextField } from './ui';
import ReferencePicker from './ReferencePicker';
import { colors, spacing, type } from '../theme';
import { digits } from '../format';
import { useLookup } from '../hooks';

/**
 * Lead Source, referrer and the customer's mobile, used by the New Lead form.
 *
 * Sources are Admin-managed (GET /leads/sources). The referrer — the CP /
 * Broker / Influencer / Freelancer who brought the customer — is picked from
 * GET /leads/references and sent as `partner_id`.
 *
 * Expects `form.source`, `form.partner`, `form.mobile`; `onChange(patch)` merges.
 */
export default function LeadSourceFields({ form, onChange, showReferrer = true, mobilePlaceholder }) {
  const sources = useLookup('sources');
  const options = (sources.items || []).map((src) => ({ label: src.name, value: src.id }));
  const selected = options.find((o) => o.value === form.source);

  return (
    <>
      <TextField
        icon="phone"
        placeholder={mobilePlaceholder || 'Mobile Number (10 digits)'}
        value={form.mobile}
        onChangeText={(v) => onChange({ mobile: digits(v, 10) })}
        keyboardType="number-pad"
        maxLength={10}
      />

      <SelectField
        icon="users"
        placeholder={sources.status === 'loading' ? 'Loading sources…' : 'Lead Source'}
        sheetTitle="Lead Source"
        value={selected ? selected.label : form.source || ''}
        options={options}
        onChange={(source) => onChange({ source })}
      />
      {sources.status === 'failed' ? (
        <Text style={s.error} onPress={sources.reload}>
          {`Couldn't load lead sources. Tap to retry.`}
        </Text>
      ) : null}

      {showReferrer ? (
        <ReferencePicker
          pickerKey="leadReferrer"
          icon="user"
          placeholder="Referred by (optional)"
          sheetTitle="Referred by"
          value={form.partner}
          onChange={(partner) => onChange({ partner })}
        />
      ) : null}
    </>
  );
}

/** Returns an error message for these fields, or '' when valid. `optionalMobile` when editing. */
export function validateLeadSource(form, { optionalMobile = false } = {}) {
  const n = (form.mobile || '').length;
  if (optionalMobile && n === 0) return '';
  if (n !== 10) return 'Please enter the customer’s 10-digit mobile number.';
  return '';
}

const s = StyleSheet.create({
  error: { ...type.caption, color: colors.error, marginTop: -spacing.xs },
});
