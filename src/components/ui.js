/**
 * Component library — a 1:1 implementation of the Figma page
 * "01 Components / Affinity Belgravia — Light Luxury Components".
 * Every size, radius, border and colour comes from the tokens in theme.js.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Icon from './Icon';
import { colors, radius, spacing, type, shadow, borderWidth } from '../theme';
import { images } from '../data';

/* ------------------------------------------------------------- Button */

export function PrimaryButton({ label, icon, iconRight, onPress, disabled, style, compact }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btnPrimary,
        compact && { height: 48 },
        pressed && !disabled && s.btnPrimaryPressed,
        disabled && s.btnDisabled,
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={16} color={colors.onSurfaceInverse} /> : null}
      <Text style={[s.btnPrimaryLabel, disabled && s.btnDisabledLabel]}>{label}</Text>
      {iconRight ? <Icon name={iconRight} size={16} color={disabled ? colors.muted : colors.onSurfaceInverse} /> : null}
    </Pressable>
  );
}

export function SecondaryButton({ label, icon, onPress, disabled, style }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btnSecondary,
        pressed && !disabled && { backgroundColor: colors.glassTint },
        disabled && { borderColor: colors.border },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={16} color={disabled ? colors.muted : colors.brandPrimary} /> : null}
      <Text style={[s.btnSecondaryLabel, disabled && { color: colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

export function RoundIconButton({ name, onPress, size = 40, iconSize = 18, tone = 'light', style, badge }) {
  const isDark = tone === 'dark';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.roundBtn,
        { width: size, height: size, borderRadius: size / 2 },
        isDark && { backgroundColor: colors.surfaceInverse, borderColor: colors.surfaceInverse },
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      <Icon name={name} size={iconSize} color={isDark ? colors.onSurfaceInverse : colors.onSurface} />
      {badge ? <View style={s.roundBtnBadge} /> : null}
    </Pressable>
  );
}

/* -------------------------------------------------------------- Input */

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  error,
  disabled,
  keyboardType,
  multiline,
  maxLength,
  showCounter,
  style,
  rightIcon,
  onRightIconPress,
  autoCapitalize,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ alignSelf: 'stretch' }, style]}>
      {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
      <View
        style={[
          s.field,
          multiline && { height: 92, alignItems: 'flex-start', paddingTop: 14 },
          focused && s.fieldFocused,
          error && s.fieldError,
          disabled && s.fieldDisabled,
        ]}
      >
        {icon ? (
          <Icon name={icon} size={18} color={disabled ? colors.borderStrong : colors.brandPrimary} />
        ) : null}
        <TextInput
          style={[s.fieldInput, multiline && { height: '100%', textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          editable={!disabled}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} hitSlop={8}>
            <Icon name={rightIcon} size={18} color={colors.brandPrimary} />
          </Pressable>
        ) : null}
      </View>
      {showCounter && maxLength ? (
        <Text style={s.counter}>{`${(value || '').length}/${maxLength}`}</Text>
      ) : null}
      {error ? <Text style={s.fieldErrorText}>{error}</Text> : null}
    </View>
  );
}

export function SelectField({
  label,
  value,
  placeholder,
  options = [],
  onChange,
  icon,
  error,
  disabled,
  style,
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[{ alignSelf: 'stretch' }, style]}>
      {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        style={[s.field, open && s.fieldFocused, error && s.fieldError, disabled && s.fieldDisabled]}
      >
        {icon ? (
          <Icon name={icon} size={18} color={disabled ? colors.borderStrong : colors.brandPrimary} />
        ) : null}
        <Text
          style={[s.fieldInput, s.selectValue, { color: value ? colors.onSurface : colors.muted }]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Icon name="chevron-down" size={18} color={colors.muted} />
      </Pressable>
      {error ? <Text style={s.fieldErrorText}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={s.optionSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>{label || placeholder}</Text>
            <ScrollView style={{ maxHeight: 340 }}>
              {options.map((opt) => {
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const optValue = typeof opt === 'string' ? opt : opt.value ?? opt.label;
                const selected = optLabel === value;
                return (
                  <Pressable
                    key={optValue}
                    onPress={() => {
                      onChange?.(optValue);
                      setOpen(false);
                    }}
                    style={[s.optionRow, selected && { backgroundColor: colors.glassTint }]}
                  >
                    <Text style={[s.optionLabel, selected && { color: colors.brandPrimary }]}>{optLabel}</Text>
                    {selected ? <Icon name="check" size={16} color={colors.brandPrimary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export function SearchBar({ value, onChangeText, placeholder = 'Search by name or phone', onFilterPress, style }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ flexDirection: 'row', gap: spacing.md }, style]}>
      <View style={[s.search, focused && s.fieldFocused]}>
        <Icon name="search" size={16} color={focused ? colors.brandPrimary : colors.muted} />
        <TextInput
          style={s.searchInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {value ? (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <Icon name="x" size={16} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {onFilterPress ? (
        <Pressable onPress={onFilterPress} style={s.filterBtn}>
          <Icon name="sliders" size={18} color={colors.onSurface} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* --------------------------------------------------------------- Chip */

export function Chip({ label, count, selected, disabled, onPress, icon, style }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        s.chip,
        selected && s.chipSelected,
        disabled && { backgroundColor: colors.overlaySoft, borderColor: colors.border },
        style,
      ]}
    >
      {icon ? (
        <Icon name={icon} size={14} color={selected ? colors.onBrand : colors.onSurfaceTertiary} />
      ) : null}
      <Text
        style={[
          s.chipLabel,
          selected && { color: colors.onBrand },
          disabled && { color: colors.muted },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {count != null ? (
        <Text style={[s.chipCount, selected && { color: colors.onBrand }]}>{count}</Text>
      ) : null}
    </Pressable>
  );
}

export function ChipRow({ options, value, onChange, style, contentStyle }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={[{ gap: spacing.sm, paddingHorizontal: spacing.lg }, contentStyle]}
    >
      {options.map((opt) => {
        const id = typeof opt === 'string' ? opt : opt.id;
        const label = typeof opt === 'string' ? opt : opt.label;
        const count = typeof opt === 'string' ? undefined : opt.count;
        return (
          <Chip key={id} label={label} count={count} selected={value === id} onPress={() => onChange(id)} />
        );
      })}
    </ScrollView>
  );
}

export function Segmented({ options, value, onChange, style }) {
  return (
    <View style={[s.segmented, style]}>
      {options.map((opt) => {
        const id = typeof opt === 'string' ? opt : opt.id;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = value === id;
        return (
          <Pressable key={id} onPress={() => onChange(id)} style={[s.segment, active && s.segmentActive]}>
            <Text style={[s.segmentLabel, active && s.segmentLabelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* --------------------------------------------------------- Status pill */

const PILL_TONES = {
  success: { bg: colors.successSoft, fg: colors.onSuccessSoft },
  error: { bg: colors.errorSoft, fg: colors.onErrorSoft },
  info: { bg: colors.infoSoft, fg: colors.onSurfaceTertiary },
  warning: { bg: colors.glassTint, fg: colors.brandPrimary },
  neutral: { bg: colors.surfaceTertiary, fg: colors.onSurfaceTertiary },
};

export const toneForStatus = (status = '') => {
  const v = String(status).toLowerCase();
  if (['confirmed', 'completed', 'available', 'converted', 'attended', 'active', 'success'].includes(v)) return 'success';
  if (['cancelled', 'sold', 'not interested', 'error', 'rejected'].includes(v)) return 'error';
  if (['pending', 'booked', 'in progress', 'upcoming', 'not matured'].includes(v)) return 'warning';
  return 'neutral';
};

export function StatusPill({ label, tone = 'info', style, textStyle }) {
  const t = PILL_TONES[tone] || PILL_TONES.info;
  return (
    <View style={[s.pill, { backgroundColor: t.bg }, style]}>
      <Text style={[s.pillLabel, { color: t.fg }, textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* --------------------------------------------------------------- Card */

export function Card({ children, style, onPress, selected }) {
  const content = (
    <View style={[s.card, selected && s.cardSelected, style]}>{children}</View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.85 }}>
      {content}
    </Pressable>
  );
}

export function KeyValue({ label, value, icon, style, valueStyle, compact }) {
  return (
    <View style={[{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }, style]}>
      {icon ? (
        <View style={{ paddingTop: 2 }}>
          <Icon name={icon} size={16} color={colors.brandPrimary} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={s.kvLabel}>{label}</Text>
        <Text style={[compact ? s.kvValueSmall : s.kvValue, valueStyle]}>{value}</Text>
      </View>
    </View>
  );
}

export function Avatar({ source, name = '', size = 48, style, badge }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <View style={[{ width: size, height: size }, style]}>
      {source ? (
        <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.surfaceTertiary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ ...type.bodySmall, color: colors.brandPrimary }}>{initials}</Text>
        </View>
      )}
      {badge ? (
        <View style={[s.avatarBadge, { left: size * 0.62, top: size * 0.62 }]}>
          <Icon name={badge} size={9} color={colors.onBrand} />
        </View>
      ) : null}
    </View>
  );
}

export function ListRow({ title, subtitle, icon, right, onPress, style, iconTone = 'soft' }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.listRow, pressed && { backgroundColor: colors.overlaySoft }, style]}
    >
      {icon ? (
        <View style={[s.listIcon, iconTone === 'plain' && { backgroundColor: 'transparent' }]}>
          <Icon name={icon} size={18} color={colors.brandPrimary} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={s.listTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={s.listSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right !== undefined ? right : <Icon name="chevron-right" size={18} color={colors.muted} />}
    </Pressable>
  );
}

/* ------------------------------------------------------------ Divider */

export function Divider({ style }) {
  return <View style={[s.divider, style]} />;
}

export function SectionTitle({ children, style, action, onAction }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>
      <Text style={s.sectionTitle}>{children}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={s.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Eyebrow({ children, style }) {
  return <Text style={[s.eyebrow, style]}>{children}</Text>;
}

/* ------------------------------------------------------- Bottom sheet */

export function BottomSheet({ visible, onClose, title, children, onCloseIcon = true }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.modalBackdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.sheetHandle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={s.sheetTitle}>{title}</Text>
            {onCloseIcon ? (
              <Pressable onPress={onClose} style={s.sheetClose} hitSlop={8}>
                <Icon name="x" size={16} color={colors.onSurface} />
              </Pressable>
            ) : null}
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Centre-screen dialog, as used by the `lead-update-popup` screen. */
export function CenterDialog({ visible, onClose, title, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.dialogBackdrop}>
        <View style={s.dialog}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={s.dialogTitle}>{title}</Text>
            <Pressable onPress={onClose} style={s.sheetClose} hitSlop={8}>
              <Icon name="x" size={16} color={colors.onSurface} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

/* ------------------------------------------------------ Wizard header */

export function WizardHeader({ step, total, title, subtitle, onBack, showLogo = true }) {
  return (
    <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44 }}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={{ paddingRight: spacing.md }}>
            <Icon name="chevron-left" size={20} color={colors.onSurface} />
          </Pressable>
        ) : null}
        {showLogo ? <Image source={images.logo} style={s.wizardLogo} resizeMode="contain" /> : null}
        <View style={{ flex: 1 }} />
        {step ? <Text style={s.stepLabel}>{`Step ${step} of ${total}`}</Text> : null}
      </View>
      <Text style={[type.pageTitle, { color: colors.onSurface, marginTop: spacing.lg }]}>{title}</Text>
      {subtitle ? <Text style={s.wizardSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function StickyFooter({ children, style }) {
  return <View style={[s.stickyFooter, style]}>{children}</View>;
}

/* ------------------------------------------------------ Success state */

export function SuccessState({ title, body, note, primaryLabel, onPrimary, secondaryLabel, onSecondary }) {
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: spacing.xl }}>
      <View style={s.successBadge}>
        <Icon name="check" size={28} color={colors.onBrand} strokeWidth={2} />
      </View>
      <Text style={[type.display, { color: colors.onSurface, marginTop: spacing.xl }]}>{title}</Text>
      {body ? <Text style={s.successBody}>{body}</Text> : null}
      {note ? <Text style={s.successNote}>{note}</Text> : null}
      {primaryLabel ? (
        <PrimaryButton
          label={primaryLabel}
          iconRight="arrow-right"
          onPress={onPrimary}
          style={{ marginTop: spacing.xxl, alignSelf: 'stretch' }}
        />
      ) : null}
      {secondaryLabel ? (
        <Pressable onPress={onSecondary} hitSlop={8} style={{ marginTop: spacing.lg }}>
          <Text style={s.linkText}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ---------------------------------------------------------- Donut */

/** Donut chart used by the MIS report summary cards. */
export function Donut({ segments, size = 110, strokeWidth = 14, centerValue, centerLabel }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.surfaceTertiary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((seg) => {
          const len = (seg.pct / 100) * c;
          const el = (
            <Circle
              key={seg.id}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += len;
          return el;
        })}
      </Svg>
      <Text style={[type.heading, { color: colors.onSurface }]}>{centerValue}</Text>
      <Text style={[type.caption, { color: colors.muted }]}>{centerLabel}</Text>
    </View>
  );
}

/* --------------------------------------------------------- Empty state */

export function EmptyState({ icon = 'search', title, body }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl }}>
      <View style={s.emptyIcon}>
        <Icon name={icon} size={22} color={colors.muted} />
      </View>
      <Text style={[type.body, { color: colors.onSurface, marginTop: spacing.lg }]}>{title}</Text>
      {body ? (
        <Text style={[type.bodySmall, { color: colors.muted, textAlign: 'center', marginTop: spacing.xs }]}>
          {body}
        </Text>
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------- styles */

const s = StyleSheet.create({
  btnPrimary: {
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceInverse,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  btnPrimaryPressed: { backgroundColor: '#2a2926' },
  btnPrimaryLabel: { ...type.body, color: colors.onSurfaceInverse },
  btnDisabled: { backgroundColor: colors.surfaceTertiary },
  btnDisabledLabel: { color: colors.muted },

  btnSecondary: {
    height: 56,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.brandPrimary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  btnSecondaryLabel: { ...type.body, color: colors.brandPrimary },

  roundBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
  },
  roundBtnBadge: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.surfaceSecondary,
  },

  fieldLabel: { ...type.caption, color: colors.onSurfaceTertiary, marginBottom: spacing.sm },
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
  fieldFocused: { borderColor: colors.brandPrimary, borderWidth: borderWidth.selected },
  fieldError: { borderColor: colors.error, borderWidth: borderWidth.selected },
  fieldDisabled: { backgroundColor: colors.overlaySoft, borderColor: colors.border },
  fieldInput: { flex: 1, ...type.body, color: colors.onSurface, padding: 0 },
  selectValue: { fontSize: 15 },
  fieldErrorText: { ...type.caption, color: colors.onErrorSoft, marginTop: spacing.xs },
  counter: { ...type.caption, color: colors.muted, alignSelf: 'flex-end', marginTop: spacing.xs },

  search: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  searchInput: { flex: 1, ...type.bodySmall, color: colors.onSurface, padding: 0 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chip: {
    height: 36,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipSelected: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipLabel: { ...type.bodySmall, color: colors.onSurfaceTertiary },
  chipCount: { ...type.caption, color: colors.brandPrimary },

  segmented: {
    flexDirection: 'row',
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
  },
  segment: { flex: 1, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: colors.brandPrimary },
  segmentLabel: { ...type.bodySmall, color: colors.onSurfaceTertiary },
  segmentLabelActive: { color: colors.onBrand },

  pill: {
    height: 24,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  pillLabel: { ...type.caption },

  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.xl,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardSelected: { borderColor: colors.brandPrimary, borderWidth: borderWidth.selected },

  kvLabel: { ...type.caption, color: colors.muted },
  kvValue: { ...type.body, color: colors.onSurface, marginTop: 2 },
  kvValueSmall: { ...type.bodySmall, color: colors.onSurface, marginTop: 2 },

  avatarBadge: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surfaceSecondary,
  },

  listRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.glassTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTitle: { ...type.body, color: colors.onSurface },
  listSubtitle: { ...type.caption, color: colors.muted, marginTop: 2 },

  divider: { height: 1, backgroundColor: colors.divider, alignSelf: 'stretch' },
  sectionTitle: { ...type.heading, color: colors.onSurface },
  sectionAction: { ...type.bodySmall, color: colors.brandPrimary },
  eyebrow: { ...type.eyebrow, color: colors.brandPrimary },

  modalBackdrop: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  optionSheet: {
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: { ...type.heading, color: colors.onSurface, marginBottom: spacing.sm },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  optionLabel: { ...type.body, color: colors.onSurface },

  dialogBackdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 24,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadow.raised,
  },
  dialogTitle: { ...type.heading, color: colors.onSurface },

  wizardLogo: { width: 34, height: 44 },
  stepLabel: { ...type.bodySmall, color: colors.onSurfaceTertiary },
  wizardSubtitle: { ...type.bodySmall, color: colors.muted, marginTop: spacing.xs },

  stickyFooter: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    backgroundColor: colors.glassFill,
    borderTopWidth: borderWidth.default,
    borderTopColor: colors.border,
    gap: spacing.md,
  },

  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBody: { ...type.body, color: colors.muted, textAlign: 'center', marginTop: spacing.md },
  successNote: { ...type.bodySmall, color: colors.muted, textAlign: 'center', marginTop: spacing.xl },
  linkText: { ...type.bodySmall, color: colors.brandPrimary },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const uiStyles = s;
