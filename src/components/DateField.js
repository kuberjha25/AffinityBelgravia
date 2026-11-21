import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, radius, spacing, type, borderWidth } from '../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const YEARS_PAST = 100;
const YEARS_FUTURE = 10;

export const formatDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** Parses the app's "28 May 2024" display dates; returns 0 when it can't. */
export const parseDisplayDate = (str = '') => {
  const m = String(str).trim().match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*,?\s+(\d{4})$/);
  if (!m) return 0;
  const month = MONTHS.indexOf(m[2].charAt(0).toUpperCase() + m[2].slice(1, 3).toLowerCase());
  return month < 0 ? 0 : new Date(Number(m[3]), month, Number(m[1])).getTime();
};

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Calendar field, laid out like Meraqui's: calendar icon, the date (or the
 * placeholder), a chevron; tapping opens a bottom sheet with Cancel / Done.
 * The sheet drills year → month → day from its header. Self-contained, so the
 * app needs no native date-picker dependency. `value` / `onChange` use the
 * "21 Nov 2026" display format.
 */
export default function DateField({ label, value, placeholder = 'Select date', onChange, icon = 'calendar', style, disabled }) {
  const [open, setOpen] = useState(false);
  const current = parseDisplayDate(value);

  const openPicker = () => {
    if (disabled) return;
    Keyboard.dismiss();
    setOpen(true);
  };

  return (
    <View style={[{ alignSelf: 'stretch' }, style]}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <Pressable
        onPress={openPicker}
        style={[s.field, open && s.fieldOpen, disabled && s.fieldDisabled]}
      >
        <Icon name={icon} size={18} color={disabled ? colors.borderStrong : colors.brandPrimary} />
        <Text style={[s.value, !value && { color: colors.muted }]} numberOfLines={1}>{value || placeholder}</Text>
        <Icon name="chevron-down" size={18} color={colors.brandPrimary} />
      </Pressable>

      <DatePickerSheet
        visible={open}
        value={current ? new Date(current) : undefined}
        title={label || placeholder}
        onCancel={() => setOpen(false)}
        onConfirm={(d) => {
          onChange?.(formatDate(d));
          setOpen(false);
        }}
      />
    </View>
  );
}

/** Bottom-sheet calendar: Cancel · title · Done; the pick only applies on Done. */
export function DatePickerSheet({ visible, value, title, onConfirm, onCancel }) {
  const [draft, setDraft] = useState(value || new Date());
  const [view, setView] = useState(value || new Date());
  const [level, setLevel] = useState('day'); // day | month | year

  useEffect(() => {
    if (!visible) return;
    setDraft(value || new Date());
    setView(value || new Date());
    setLevel('day');
    // Re-seed only when the sheet opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const year = view.getFullYear();
  const month = view.getMonth();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={s.backdrop} onPress={onCancel}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.handle} />
          <View style={s.sheetHeader}>
            <Pressable onPress={onCancel} hitSlop={8}>
              <Text style={s.cancel}>Cancel</Text>
            </Pressable>
            <Text style={s.sheetTitle} numberOfLines={1}>{title || 'Select date'}</Text>
            <Pressable onPress={() => onConfirm(draft)} hitSlop={8}>
              <Text style={s.done}>Done</Text>
            </Pressable>
          </View>

          {level === 'year' ? (
            <YearGrid
              year={year}
              onSelect={(y) => {
                setView(new Date(y, month, 1));
                setLevel('month');
              }}
            />
          ) : level === 'month' ? (
            <View>
              <NavHeader
                label={String(year)}
                onLabelPress={() => setLevel('year')}
                onPrev={() => setView(new Date(year - 1, month, 1))}
                onNext={() => setView(new Date(year + 1, month, 1))}
              />
              <View style={s.wrap}>
                {MONTHS.map((m, i) => {
                  const active = i === month;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => {
                        setView(new Date(year, i, 1));
                        setLevel('day');
                      }}
                      style={s.monthCell}
                    >
                      <View style={[s.monthPill, active && s.active]}>
                        <Text style={[s.cellText, active && s.activeText]}>{m}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <View>
              <NavHeader
                label={`${MONTHS_LONG[month]} ${year}`}
                onLabelPress={() => setLevel('year')}
                onPrev={() => setView(new Date(year, month - 1, 1))}
                onNext={() => setView(new Date(year, month + 1, 1))}
              />
              <DayGrid year={year} month={month} selected={draft} onSelect={setDraft} />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function NavHeader({ label, onLabelPress, onPrev, onNext }) {
  return (
    <View style={s.nav}>
      <Pressable onPress={onPrev} hitSlop={10} style={s.navBtn}>
        <Icon name="chevron-left" size={18} color={colors.brandPrimary} />
      </Pressable>
      <Pressable onPress={onLabelPress} hitSlop={8} style={s.navTitle}>
        <Text style={s.navLabel}>{label}</Text>
        <Icon name="chevron-down" size={14} color={colors.brandPrimary} />
      </Pressable>
      <Pressable onPress={onNext} hitSlop={10} style={s.navBtn}>
        <Icon name="chevron-right" size={18} color={colors.brandPrimary} />
      </Pressable>
    </View>
  );
}

function YearGrid({ year, onSelect }) {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: YEARS_PAST + YEARS_FUTURE + 1 }, (_, i) => thisYear + YEARS_FUTURE - i);
  const ROW = 46;
  const ref = useRef(null);
  const idx = years.indexOf(year);

  useEffect(() => {
    const row = idx >= 0 ? Math.floor(idx / 4) : 0;
    ref.current?.scrollTo({ y: Math.max(0, (row - 2) * ROW), animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView ref={ref} style={{ height: 280 }} showsVerticalScrollIndicator={false}>
      <View style={s.wrap}>
        {years.map((y) => {
          const active = y === year;
          return (
            <Pressable key={y} onPress={() => onSelect(y)} style={[s.yearCell, { height: ROW }]}>
              <View style={[s.yearPill, active && s.active]}>
                <Text style={[s.cellText, active && s.activeText]}>{y}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function DayGrid({ year, month, selected, onSelect }) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const today = new Date();

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((w, i) => (
          <Text key={`${w}${i}`} style={s.weekday}>{w}</Text>
        ))}
      </View>
      <View style={s.wrap}>
        {cells.map((d, i) => {
          if (d === null) return <View key={`b${i}`} style={s.dayCell} />;
          const date = new Date(year, month, d);
          const active = sameDay(date, selected);
          const isToday = sameDay(date, today);
          return (
            <Pressable key={d} onPress={() => onSelect(date)} style={s.dayCell}>
              <View style={[s.dayDot, active && s.active, !active && isToday && s.today]}>
                <Text style={[s.cellText, active && s.activeText]}>{d}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  label: { ...type.caption, color: colors.onSurfaceTertiary, marginBottom: spacing.sm },
  field: {
    minHeight: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  fieldOpen: { borderColor: colors.brandPrimary, borderWidth: borderWidth.selected },
  fieldDisabled: { backgroundColor: colors.overlaySoft },
  value: { flex: 1, ...type.body, fontSize: 15, color: colors.onSurface },

  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.28)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 },
  sheetTitle: { ...type.heading, fontSize: 18, color: colors.onSurface, flexShrink: 1, textAlign: 'center' },
  cancel: { ...type.bodySmall, color: colors.muted },
  done: { ...type.bodySmall, color: colors.brandPrimary, fontWeight: '600' },

  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { padding: 4 },
  navTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navLabel: { ...type.body, fontSize: 15, color: colors.onSurface },

  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { ...type.caption, color: colors.muted, width: `${100 / 7}%`, textAlign: 'center', paddingVertical: 6 },
  dayCell: { width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' },
  dayDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1, borderColor: colors.brandPrimary },
  monthCell: { width: '25%', height: 52, alignItems: 'center', justifyContent: 'center' },
  monthPill: { width: '88%', height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  yearCell: { width: '25%', alignItems: 'center', justifyContent: 'center' },
  yearPill: { width: '80%', height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: colors.brandPrimary },
  activeText: { color: colors.onBrand },
  cellText: { ...type.bodySmall, color: colors.onSurface },
});
