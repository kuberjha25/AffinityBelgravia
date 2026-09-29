import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';
import { BottomSheet } from './ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const formatDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/**
 * Calendar field. Replaces the Figma "Input / Select" with a date icon —
 * self-contained so the app needs no native date-picker dependency.
 */
export default function DateField({ label, value, placeholder = 'Select date', onChange, icon = 'calendar', style, disabled }) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => new Date());

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i += 1) cells.push(null);
    for (let d = 1; d <= days; d += 1) cells.push(new Date(year, month, d));
    return cells;
  }, [cursor]);

  const shift = (delta) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));

  return (
    <View style={[{ alignSelf: 'stretch' }, style]}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        style={[s.field, open && { borderColor: colors.brandPrimary, borderWidth: borderWidth.selected }]}
      >
        <Icon name={icon} size={18} color={colors.brandPrimary} />
        <Text style={[s.value, !value && { color: colors.muted }]}>{value || placeholder}</Text>
        <Icon name="calendar" size={18} color={colors.brandPrimary} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label || 'Select date'}>
        <View style={s.calHeader}>
          <Pressable onPress={() => shift(-1)} hitSlop={10} style={s.calNav}>
            <Icon name="chevron-left" size={18} color={colors.onSurface} />
          </Pressable>
          <Text style={s.calMonth}>{`${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`}</Text>
          <Pressable onPress={() => shift(1)} hitSlop={10} style={s.calNav}>
            <Icon name="chevron-right" size={18} color={colors.onSurface} />
          </Pressable>
        </View>

        <View style={s.weekRow}>
          {WEEKDAYS.map((w, i) => (
            <Text key={`${w}${i}`} style={s.weekday}>{w}</Text>
          ))}
        </View>

        <View style={s.grid}>
          {grid.map((d, i) => {
            const selected = d && value === formatDate(d);
            return (
              <Pressable
                key={i}
                disabled={!d}
                onPress={() => {
                  onChange?.(formatDate(d));
                  setOpen(false);
                }}
                style={[s.cell, selected && s.cellSelected]}
              >
                <Text style={[s.cellText, selected && { color: colors.onBrand }]}>{d ? d.getDate() : ''}</Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  label: { ...type.caption, color: colors.onSurfaceTertiary, marginBottom: spacing.sm },
  field: {
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  value: { flex: 1, ...type.body, fontSize: 15, color: colors.onSurface },

  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calNav: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceTertiary,
  },
  calMonth: { ...type.body, color: colors.onSurface },
  weekRow: { flexDirection: 'row' },
  weekday: { ...type.caption, color: colors.muted, width: `${100 / 7}%`, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  cellSelected: { backgroundColor: colors.brandPrimary },
  cellText: { ...type.bodySmall, color: colors.onSurface },
});
