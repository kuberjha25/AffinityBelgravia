import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import DateField from './DateField';
import { colors, spacing, type } from '../theme';
import { dateFilters } from '../data';
import { toApiDate } from '../format';

/**
 * The lists' date filter (`date_filter`, plus `start_date` / `end_date` for
 * `custom`). `label` is the chosen `dateFilters` label. Until both custom
 * dates are picked (and in order) no date filter is sent.
 * → `{ params, isCustom, start, end, setStart, setEnd, invalid }`
 */
export function useDateFilter(label) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const id = dateFilters.find((d) => d.label === label)?.id || '';
  const startIso = toApiDate(start);
  const endIso = toApiDate(end);
  const isCustom = id === 'custom';
  const invalid = Boolean(isCustom && startIso && endIso && startIso > endIso);

  const params = useMemo(() => {
    if (!isCustom) return id ? { date_filter: id } : {};
    return startIso && endIso && !invalid ? { date_filter: 'custom', start_date: startIso, end_date: endIso } : {};
  }, [id, isCustom, startIso, endIso, invalid]);

  return { params, isCustom, start, end, setStart, setEnd, invalid };
}

/** From / To pickers, shown only while the custom range is selected. */
export function DateRangeRow({ range, style }) {
  if (!range.isCustom) return null;
  const waiting = !range.params.date_filter && !range.invalid;
  return (
    <View style={[{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }, style]}>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <DateField placeholder="From" value={range.start} onChange={range.setStart} style={{ flex: 1 }} />
        <DateField placeholder="To" value={range.end} onChange={range.setEnd} style={{ flex: 1 }} />
      </View>
      {range.invalid ? (
        <Text style={{ ...type.caption, color: colors.error, marginTop: spacing.sm }}>
          The end date must be on or after the start date.
        </Text>
      ) : null}
      {waiting ? (
        <Text style={{ ...type.caption, color: colors.muted, marginTop: spacing.sm }}>
          Pick both dates to apply the range.
        </Text>
      ) : null}
    </View>
  );
}
