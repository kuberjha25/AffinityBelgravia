import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SelectField, TextField } from './ui';
import { colors, spacing, type } from '../theme';
import { leadSources, ASSOCIATE_SOURCE } from '../config';
import { digits } from '../format';
import { useApp } from '../store';

/**
 * Lead Source + customer identification, shared by the staff New Lead and
 * Schedule Visit forms.
 *
 * #4: when a CP / Freelancer / Influencer brings the customer, only the last
 * 4 digits of the customer's mobile and Aadhaar are captured — the full
 * mobile field is removed for those leads. Other sources keep the full number.
 *
 * Expects `form.source`, `form.associateId`, `form.phone`, `form.mobileLast4`,
 * `form.aadhaarLast4`; `onChange(patch)` merges into the form.
 */
export default function LeadSourceFields({ form, onChange }) {
  const { associates } = useApp();
  const viaAssociate = form.source === ASSOCIATE_SOURCE;
  const associateLabel = (a) => `${a.name} • ${a.type}`;
  const selected = associates.find((a) => a.id === form.associateId);

  return (
    <>
      <SelectField
        icon="users"
        placeholder="Lead Source"
        sheetTitle="Lead Source"
        value={form.source}
        options={leadSources.map((src) => src.label)}
        onChange={(source) => onChange({ source })}
      />

      {viaAssociate ? (
        <>
          <SelectField
            icon="user"
            placeholder="Select CP / Freelancer / Influencer"
            sheetTitle="Brought by"
            value={selected ? associateLabel(selected) : ''}
            options={associates.map((a) => ({ label: associateLabel(a), value: a.id }))}
            onChange={(associateId) => onChange({ associateId })}
          />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TextField
              icon="phone"
              label="Mobile (last 4)"
              placeholder="e.g. 3210"
              value={form.mobileLast4}
              onChangeText={(v) => onChange({ mobileLast4: digits(v, 4) })}
              keyboardType="number-pad"
              maxLength={4}
              style={{ flex: 1 }}
            />
            <TextField
              icon="file-text"
              label="Aadhaar (last 4)"
              placeholder="e.g. 4821"
              value={form.aadhaarLast4}
              onChangeText={(v) => onChange({ aadhaarLast4: digits(v, 4) })}
              keyboardType="number-pad"
              maxLength={4}
              style={{ flex: 1 }}
            />
          </View>
          <Text style={s.hint}>
            For leads brought by a CP / Freelancer / Influencer, only the last 4 digits of the
            customer's mobile and Aadhaar numbers are recorded.
          </Text>
        </>
      ) : (
        <TextField
          icon="phone"
          placeholder="Mobile Number"
          value={form.phone}
          onChangeText={(v) => onChange({ phone: v.replace(/[^0-9+ ]/g, '') })}
          keyboardType="phone-pad"
          maxLength={15}
        />
      )}
    </>
  );
}

/** Returns an error message for the source / identification fields, or '' when valid. */
export function validateLeadSource(form) {
  if (!form.source) return 'Please select the lead source.';
  if (form.source === ASSOCIATE_SOURCE) {
    if (!form.associateId) return 'Please select the CP / Freelancer / Influencer who brought this customer.';
    if ((form.mobileLast4 || '').length !== 4) return 'Enter the last 4 digits of the customer’s mobile number.';
    if ((form.aadhaarLast4 || '').length !== 4) return 'Enter the last 4 digits of the customer’s Aadhaar number.';
    return '';
  }
  if ((form.phone || '').replace(/\D/g, '').length < 10) return 'Please enter a valid mobile number.';
  return '';
}

const s = StyleSheet.create({
  hint: { ...type.caption, color: colors.muted, marginTop: -spacing.xs },
});
