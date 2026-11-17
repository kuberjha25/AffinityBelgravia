import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import { TextField, SelectField, PrimaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { requestPriorities } from '../data';
import { humanize } from '../format';
import { useLookup } from '../hooks';
import { createRequest, formatTat } from '../store/slices/requestsSlice';
import {
  categoriesKey,
  fetchInventoryCategories,
  fetchProjects,
  fetchTowers,
  fetchUnits,
  towersKey,
  unitsKey,
} from '../store/slices/projectsSlice';

const MAX_REMARKS = 1000;

/**
 * Raise a request (POST /partner-requests): type (with its turnaround time),
 * priority, an optional unit (project → tower → configuration → unit) and the
 * note. `route.params.remarks` pre-fills the note, e.g. "Lead: Name (mobile)"
 * when opened from a converted lead. `route.params.typeHint` (e.g. "document")
 * pre-selects the first request type whose name contains it.
 */
export default function NewRequestScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const types = useLookup('requestTypes');
  const projects = useSelector((state) => state.projects.list);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    typeId: null,
    priority: 'medium',
    projectId: null,
    towerId: null,
    categoryId: null,
    unitId: null,
    remarks: route?.params?.remarks || '',
  }));
  const patch = (p) => setForm((f) => ({ ...f, ...p }));

  const typeHint = route?.params?.typeHint;
  useEffect(() => {
    if (!typeHint || form.typeId || !types.items?.length) return;
    const hit = types.items.find((t) => String(t.name).toLowerCase().includes(String(typeHint).toLowerCase()));
    if (hit) patch({ typeId: hit.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeHint, types.items]);

  const { projectId, towerId, categoryId } = form;
  const towers = useSelector((state) => (projectId ? state.projects.towers.data[towersKey(projectId)] : null));
  const categories = useSelector((state) =>
    projectId && towerId ? state.projects.categories.data[categoriesKey(projectId, towerId)] : null
  );
  const units = useSelector((state) =>
    projectId && towerId && categoryId ? state.projects.units.data[unitsKey(projectId, towerId, categoryId)] : null
  );

  useEffect(() => {
    if (projects.status === 'idle') dispatch(fetchProjects({ page: 1 }));
  }, [dispatch, projects.status]);
  useEffect(() => {
    if (projectId) dispatch(fetchTowers(projectId));
  }, [dispatch, projectId]);
  useEffect(() => {
    if (projectId && towerId) dispatch(fetchInventoryCategories({ projectId, towerId }));
  }, [dispatch, projectId, towerId]);
  useEffect(() => {
    if (projectId && towerId && categoryId) dispatch(fetchUnits({ projectId, towerId, categoryId }));
  }, [dispatch, projectId, towerId, categoryId]);

  const typeOptions = useMemo(
    () =>
      (types.items || []).map((t) => ({
        label: t.tat_hours ? `${t.name} · ${formatTat(t.tat_hours)}` : t.name,
        value: t.id,
      })),
    [types.items]
  );
  const projectOptions = projects.items.map((p) => ({ label: p.name, value: p.id }));
  const towerOptions = (towers || []).map((t) => ({
    label: t.name && t.name !== t.tower ? `${t.name} (${t.tower})` : t.tower,
    value: t.id,
  }));
  const categoryOptions = (categories || []).map((c) => ({ label: c.name, value: c.id }));
  const unitOptions = (units || []).map((u) => ({
    label: [u.unit_number, u.floor ? `Floor ${u.floor}` : null, u.status_name].filter(Boolean).join(' · '),
    value: u.id,
  }));
  const labelOf = (options, value) => options.find((o) => o.value === value)?.label || '';
  const selectedType = (types.items || []).find((t) => t.id === form.typeId);

  const submit = async () => {
    if (!form.typeId) return Alert.alert('Request type', 'Please select the type of request.');
    if (!form.remarks.trim()) return Alert.alert('Details required', 'Please describe your request.');
    setSaving(true);
    try {
      const created = await dispatch(
        createRequest({
          request_type_id: form.typeId,
          remarks: form.remarks.trim(),
          inventory_id: form.unitId || undefined,
          priority: form.priority,
        })
      ).unwrap();
      Alert.alert('Request raised', 'Our team will get back to you within the turnaround time.', [
        {
          text: 'OK',
          onPress: () => (created?.id ? navigation.replace('RequestDetail', { id: created.id }) : navigation.goBack()),
        },
      ]);
    } catch (message) {
      Alert.alert('Could not raise request', String(message));
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <Screen showBack keyboardAction={<PrimaryButton label="Submit Request" onPress={submit} loading={saving} />}>
      <PageTitle>Raise Request</PageTitle>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
        <SelectField
          icon="notepad-text"
          label="Request Type"
          placeholder={types.status === 'loading' ? 'Loading request types…' : 'Select request type'}
          value={labelOf(typeOptions, form.typeId)}
          options={typeOptions}
          onChange={(typeId) => patch({ typeId })}
        />
        {types.status === 'failed' ? (
          <Text style={s.error} onPress={types.reload}>{`Couldn't load request types. Tap to retry.`}</Text>
        ) : null}
        {selectedType?.tat_hours ? (
          <Text style={s.hint}>{`Expected response within ${formatTat(selectedType.tat_hours)}.`}</Text>
        ) : null}

        <View>
          <Text style={s.label}>Priority</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {requestPriorities.map((p) => {
              const active = form.priority === p;
              return (
                <Pressable key={p} onPress={() => patch({ priority: p })} style={[s.chip, active && s.chipActive]}>
                  <Text style={[s.chipLabel, active && { color: colors.onBrand }]}>{humanize(p)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={[s.label, { marginTop: spacing.md, marginBottom: 0 }]}>Unit (optional)</Text>
        <SelectField
          icon="building"
          placeholder={projects.status === 'loading' ? 'Loading projects…' : 'Project'}
          value={labelOf(projectOptions, projectId)}
          options={projectOptions}
          onChange={(id) => patch({ projectId: id, towerId: null, categoryId: null, unitId: null })}
        />
        <SelectField
          icon="layers"
          placeholder={projectId && !towers ? 'Loading towers…' : 'Tower'}
          value={labelOf(towerOptions, towerId)}
          options={towerOptions}
          disabled={!projectId}
          onChange={(id) => patch({ towerId: id, categoryId: null, unitId: null })}
        />
        <SelectField
          icon="grid"
          placeholder={towerId && !categories ? 'Loading configurations…' : 'Configuration'}
          value={labelOf(categoryOptions, categoryId)}
          options={categoryOptions}
          disabled={!towerId}
          onChange={(id) => patch({ categoryId: id, unitId: null })}
        />
        <SelectField
          icon="shopping-bag"
          placeholder={categoryId && !units ? 'Loading units…' : 'Unit'}
          value={labelOf(unitOptions, form.unitId)}
          options={unitOptions}
          disabled={!categoryId}
          onChange={(unitId) => patch({ unitId })}
        />

        <TextField
          icon="edit"
          label="Details"
          placeholder="Describe your request…"
          value={form.remarks}
          onChangeText={(remarks) => patch({ remarks })}
          multiline
          maxLength={MAX_REMARKS}
          showCounter
          style={{ marginTop: spacing.md }}
        />

        <PrimaryButton label="Submit Request" onPress={submit} loading={saving} style={{ marginTop: spacing.sm }} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  label: { ...type.bodySmall, color: colors.muted, marginBottom: spacing.sm },
  hint: { ...type.caption, color: colors.muted, marginTop: -spacing.xs },
  error: { ...type.caption, color: colors.error },
  chip: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipLabel: { ...type.caption, color: colors.onSurfaceTertiary },
});
