import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import { TextField, SelectField, StateCityFields, PrimaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { leadTypes } from '../data';
import { digits, isMasked } from '../format';
import LeadSourceFields, { validateLeadSource } from '../components/LeadSourceFields';
import { createLead, updateLead } from '../store/slices/leadsSlice';
import { fetchProjects } from '../store/slices/projectsSlice';
import { useLookup } from '../hooks';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TYPE_TONE = {
  hot: { fg: colors.error, bg: 'rgba(180,83,74,0.06)' },
  warm: { fg: colors.brandPrimary, bg: colors.glassTint },
  cold: { fg: colors.muted, bg: colors.surfaceSecondary },
};

/**
 * Figma frame: `lead-detail-screen` @ 9651 (12:2293) — the New Lead form.
 * Staff only (#3). With `route.params.id` it edits that lead instead.
 */
export default function NewLeadScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const editId = route?.params?.id;
  const editing = useSelector((state) => (editId ? state.leads.details[editId] : null));
  const projects = useSelector((state) => state.projects.list);
  const categories = useLookup('categories');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() => ({
    fullName: editing?.full_name || '',
    email: editing?.email && !isMasked(editing.email) ? editing.email : '',
    mobile: editing?.mobile && !isMasked(editing.mobile) ? digits(editing.mobile, 10) : '',
    source: editing?.source || '',
    partner: null,
    categoryId: null,
    projectId: null,
    budget: editing?.budget ? String(editing.budget) : '',
    address: '',
    city: '',
    state: '',
    type: editing?.lead_type || 'warm',
    remarks: editing?.remarks || '',
  }));
  const patch = (p) => setForm((f) => ({ ...f, ...p }));
  const set = (key) => (value) => patch({ [key]: value });

  useEffect(() => {
    if (projects.status === 'idle') dispatch(fetchProjects({ page: 1 }));
  }, [dispatch, projects.status]);

  // The lead detail gives names; the form sends ids.
  useEffect(() => {
    if (!editing) return;
    setForm((f) => ({
      ...f,
      categoryId: f.categoryId ?? (categories.items || []).find((c) => c.name === editing.unit_category)?.id ?? null,
      projectId: f.projectId ?? projects.items.find((p) => p.name === editing.project_name)?.id ?? null,
    }));
  }, [editing, categories.items, projects.items]);

  const categoryOptions = useMemo(() => (categories.items || []).map((c) => ({ label: c.name, value: c.id })), [categories.items]);
  const projectOptions = useMemo(() => projects.items.map((p) => ({ label: p.name, value: p.id })), [projects.items]);
  const categoryLabel = categoryOptions.find((o) => o.value === form.categoryId)?.label || '';
  const projectLabel = projectOptions.find((o) => o.value === form.projectId)?.label || '';

  const submit = async () => {
    if (!form.fullName.trim()) {
      Alert.alert('Name required', 'Please enter the lead name.');
      return;
    }
    const error = validateLeadSource(form, { optionalMobile: Boolean(editing) });
    if (error) {
      Alert.alert('Check details', error);
      return;
    }
    if (form.email && !EMAIL.test(form.email.trim())) {
      Alert.alert('Email address', 'Please enter a valid email address.');
      return;
    }

    const body = {
      full_name: form.fullName.trim(),
      mobile: form.mobile || undefined,
      email: form.email.trim() || undefined,
      lead_type: form.type,
      source: form.source || undefined,
      unit_category: form.categoryId || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      project_id: form.projectId || undefined,
      address: form.address.trim() || undefined,
      state: form.state || undefined,
      city: form.city || undefined,
      remarks: form.remarks.trim() || undefined,
    };

    setSaving(true);
    try {
      if (editing) {
        await dispatch(updateLead({ id: editing.id, body })).unwrap();
        Alert.alert('Lead updated', `${body.full_name}'s details have been saved.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const created = await dispatch(createLead({ ...body, partner_id: form.partner?.id })).unwrap();
        Alert.alert('Lead submitted', `${body.full_name} has been added to your leads.`, [
          {
            text: 'OK',
            onPress: () =>
              created?.id ? navigation.replace('LeadDetail', { id: created.id }) : navigation.goBack(),
          },
        ]);
      }
    } catch (message) {
      Alert.alert('Could not save', String(message));
    } finally {
      setSaving(false);
    }
  };

  const submitLabel = editing ? 'Save Changes' : 'Submit Lead';

  return (
    <Screen showBack keyboardAction={<PrimaryButton label={submitLabel} onPress={submit} loading={saving} />}>
      <PageTitle>{editing ? 'Edit Lead' : 'New Lead'}</PageTitle>

      <View style={{ paddingHorizontal: spacing.xl }}>
        <Text style={s.group}>Details</Text>
        <View style={{ gap: spacing.md }}>
          <TextField icon="user" placeholder="Full Name" value={form.fullName} onChangeText={set('fullName')} maxLength={200} />
          <TextField icon="mail" placeholder="Email Address" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
          <LeadSourceFields
            form={form}
            onChange={patch}
            showReferrer={!editing}
            mobilePlaceholder={editing ? 'Mobile (leave blank to keep current)' : undefined}
          />
        </View>

        <Text style={s.group}>Address</Text>
        <View style={{ gap: spacing.md }}>
          <TextField icon="map-pin" placeholder="Address" value={form.address} onChangeText={set('address')} />
          <StateCityFields
            row
            state={form.state}
            city={form.city}
            onChange={({ state, city }) => patch({ state, city })}
          />
        </View>

        <Text style={s.group}>Interest Details (optional)</Text>
        <View style={{ gap: spacing.md }}>
          <SelectField
            icon="building"
            placeholder={projects.status === 'loading' ? 'Loading projects…' : 'Project'}
            value={projectLabel}
            options={projectOptions}
            onChange={set('projectId')}
          />
          <SelectField
            icon="layers"
            placeholder={categories.status === 'loading' ? 'Loading configurations…' : 'Configuration'}
            sheetTitle="Configuration"
            value={categoryLabel}
            options={categoryOptions}
            onChange={set('categoryId')}
          />
          <TextField
            icon="hash"
            placeholder="Budget (₹)"
            value={form.budget}
            onChangeText={(v) => set('budget')(digits(v, 12))}
            keyboardType="number-pad"
          />
        </View>

        <Text style={s.group}>Lead Type</Text>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          {leadTypes.map((t) => {
            const active = form.type === t.id;
            const tone = TYPE_TONE[t.id];
            return (
              <Pressable
                key={t.id}
                onPress={() => set('type')(t.id)}
                style={[s.typeChip, { backgroundColor: active ? tone.bg : colors.surfaceSecondary }, active && { borderColor: tone.fg }]}
              >
                <Icon name={t.icon} size={16} color={active ? tone.fg : colors.muted} />
                <Text style={[s.typeLabel, active && { color: tone.fg }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={s.group}>Remarks</Text>
        <TextField
          icon="edit"
          placeholder="Enter remarks (optional)"
          value={form.remarks}
          onChangeText={set('remarks')}
          multiline
          maxLength={500}
          showCounter
        />

        <PrimaryButton label={submitLabel} onPress={submit} loading={saving} style={{ marginTop: spacing.lg }} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  group: { ...type.bodySmall, color: colors.muted, marginTop: spacing.xl, marginBottom: spacing.md },
  typeChip: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  typeLabel: { ...type.body, color: colors.muted },
});
