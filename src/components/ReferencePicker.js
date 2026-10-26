import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from './Icon';
import { BottomSheet, LoadMore, uiStyles } from './ui';
import { colors, spacing, type } from '../theme';
import { searchReferences } from '../store/slices/lookupsSlice';
import { hasMore, listInitial } from '../store/helpers';
import { useDebounced } from '../hooks';

const EMPTY = listInitial();

/**
 * Picks a person from GET /leads/references (searched on the server, 10 per
 * page). `userType="backoffice"` limits it to staff. `value` / `onChange` use
 * the reference row `{ id, name, mobile, display_text }`.
 */
export default function ReferencePicker({
  pickerKey,
  userType,
  value,
  onChange,
  label,
  placeholder = 'Select',
  sheetTitle,
  icon = 'user',
  disabled,
}) {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.lookups.references[pickerKey]) || EMPTY;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const search = useDebounced(query.trim(), 350);

  const load = (page = 1) => dispatch(searchReferences({ key: pickerKey, userType, search, page }));

  useEffect(() => {
    if (open) load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, search]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const loading = list.status === 'loading';

  return (
    <View style={{ alignSelf: 'stretch' }}>
      {label ? <Text style={uiStyles.fieldLabel}>{label}</Text> : null}
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        style={[uiStyles.field, open && uiStyles.fieldFocused, disabled && uiStyles.fieldDisabled]}
      >
        <Icon name={icon} size={18} color={disabled ? colors.borderStrong : colors.brandPrimary} />
        <Text
          style={[uiStyles.fieldInput, uiStyles.selectValue, { color: value ? colors.onSurface : colors.muted }]}
          numberOfLines={1}
        >
          {value ? value.display_text || value.name : placeholder}
        </Text>
        {value && !disabled ? (
          <Pressable onPress={() => onChange(null)} hitSlop={8} accessibilityLabel="Clear">
            <Icon name="x" size={16} color={colors.muted} />
          </Pressable>
        ) : (
          <Icon name="chevron-down" size={18} color={colors.muted} />
        )}
      </Pressable>

      <BottomSheet visible={open} onClose={close} title={sheetTitle || label || placeholder}>
        <View style={[uiStyles.search, uiStyles.sheetSearch]}>
          <Icon name="search" size={16} color={colors.muted} />
          <TextInput
            style={uiStyles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or mobile"
            placeholderTextColor={colors.muted}
            autoCorrect={false}
          />
          {loading ? <ActivityIndicator size="small" color={colors.brandPrimary} /> : null}
        </View>
        <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
          {list.status === 'failed' ? (
            <Pressable onPress={() => load(1)} style={s.row}>
              <Text style={[s.name, { color: colors.error }]}>{list.error}</Text>
              <Text style={s.retry}>Retry</Text>
            </Pressable>
          ) : null}
          {list.status === 'succeeded' && list.items.length === 0 ? (
            <Text style={[s.name, { color: colors.muted, padding: spacing.md }]}>No matches</Text>
          ) : null}
          {list.items.map((item) => {
            const selected = value?.id === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  onChange(item);
                  close();
                }}
                style={[s.row, selected && { backgroundColor: colors.glassTint }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.name, selected && { color: colors.brandPrimary }]}>
                    {item.display_text || item.name}
                  </Text>
                  {item.mobile ? <Text style={s.meta}>{item.mobile}</Text> : null}
                </View>
                {selected ? <Icon name="check" size={16} color={colors.brandPrimary} /> : null}
              </Pressable>
            );
          })}
          <LoadMore
            visible={hasMore(list)}
            loading={loading && list.page > 0 && list.items.length > 0}
            onPress={() => load(list.page + 1)}
          />
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  name: { ...type.body, color: colors.onSurface },
  meta: { ...type.caption, color: colors.muted, marginTop: 2 },
  retry: { ...type.bodySmall, color: colors.brandPrimary },
});
