import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Icon from './Icon';
import { BottomSheet } from './ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const formatDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** Parses the app's "28 May 2024" display dates; returns 0 when it can't. */
export const parseDisplayDate = (str = '') => {
  const m = String(str).trim().match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*,?\s+(\d{4})$/);
  if (!m) return 0;
  const month = MONTHS.indexOf(m[2].charAt(0).toUpperCase() + m[2].slice(1, 3).toLowerCase());
  return month < 0 ? 0 : new Date(Number(m[3]), month, Number(m[1])).getTime();
};

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 101 }, (_, i) => THIS_YEAR + 5 - i);

/**
 * Calendar field. Replaces the Figma "Input / Select" with a date icon —
 * self-contained so the app needs no native date-picker dependency.
 */
export default function DateField({ label, value, placeholder = 'Select date', onChange, icon = 'calendar', style, disabled }) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => new Date());
  const [pickYear, setPickYear] = useState(false);

  const openPicker = () => {
    if (disabled) return;
    const current = parseDisplayDate(value);
    setCursor(current ? new Date(current) : new Date());
    setPickYear(false);
    setOpen(true);
  };

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
        onPress={openPicker}
        style={[s.field, open && { borderColor: colors.brandPrimary, borderWidth: borderWidth.selected }]}
      >
        <Icon name={icon} size={18} color={colors.brandPrimary} />
        <Text style={[s.value, !value && { color: colors.muted }]} numberOfLines={1}>{value || placeholder}</Text>
        <Icon name="calendar" size={18} color={colors.brandPrimary} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label || 'Select date'}>
        <View style={s.calHeader}>
          <Pressable onPress={() => shift(-1)} hitSlop={10} style={s.calNav}>
            <Icon name="chevron-left" size={18} color={colors.onSurface} />
          </Pressable>
          <Pressable onPress={() => setPickYear((v) => !v)} hitSlop={8} style={s.calTitle}>
            <Text style={s.calMonth}>{`${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`}</Text>
            <Icon
              name="chevron-down"
              size={14}
              color={colors.brandPrimary}
              style={pickYear ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
          </Pressable>
          <Pressable onPress={() => shift(1)} hitSlop={10} style={s.calNav}>
            <Icon name="chevron-right" size={18} color={colors.onSurface} />
          </Pressable>
        </View>

        {pickYear ? (
          <ScrollView style={{ maxHeight: 280 }} contentContainerStyle={s.yearGrid}>
            {YEARS.map((y) => {
              const selected = y === cursor.getFullYear();
              return (
                <Pressable
                  key={y}
                  onPress={() => {
                    setCursor(new Date(y, cursor.getMonth(), 1));
                    setPickYear(false);
                  }}
                  style={[s.yearCell, selected && s.cellSelected]}
                >
                  <Text style={[s.cellText, selected && { color: colors.onBrand }]}>{y}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
        <>
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
        </>
        )}
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
  calTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  calMonth: { ...type.body, color: colors.onSurface },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  yearCell: { width: '25%', height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
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
