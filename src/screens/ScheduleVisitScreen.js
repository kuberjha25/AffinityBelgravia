import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import DateField from '../components/DateField';
import ReferencePicker from '../components/ReferencePicker';
import { TextField, SelectField, PrimaryButton } from '../components/ui';
import StateCityFields from '../components/StateCityFields';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { leadTypes } from '../data';
import { digits, isMasked, toApiDate } from '../format';
import { usePermissions } from '../store';
import { lookupVisitLead, scheduleVisit } from '../store/slices/visitsSlice';
import { fetchProjects } from '../store/slices/projectsSlice';
import { findReference } from '../store/slices/lookupsSlice';
import { useLookup } from '../hooks';

const TYPE_TONE = {
  hot: { fg: colors.error, bg: 'rgba(180,83,74,0.10)' },
  warm: { fg: colors.brandPrimary, bg: colors.glassTint },
  cold: { fg: colors.success, bg: colors.surfaceSecondary },
};

/**
 * Figma frame: `schedule-visit-screen` (12:1176). Staff only (#3).
 * The backend creates the lead (or reuses it, matched by mobile) and books the visit.
 *
 * Once a 10-digit mobile is typed, POST /visits/fetch-lead looks the lead up:
 * - found → the form is pre-filled; Full Name, Email and Lead For are locked
 *   and `email` is left out of the request;
 * - 403 → the number belongs to another partner; submitting is blocked.
 * Opened from a lead (`route.params.leadId`) the customer's details are pre-filled.
 */
export default function ScheduleVisitScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const leadId = route?.params?.leadId;
  const lead = useSelector((state) => (leadId ? state.leads.details[leadId] : null));
  const projects = useSelector((state) => state.projects.list);
  const timeSlots = useLookup('timeSlots');
  const { isStaff } = usePermissions();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() => ({
    fullName: lead?.full_name || '',
    mobile: lead?.mobile && !isMasked(lead.mobile) ? digits(lead.mobile, 10) : '',
    email: lead?.email && !isMasked(lead.email) ? lead.email : '',
    address: '',
    city: '',
    state: '',
    projectId: null,
    leadType: lead?.lead_type || 'hot',
    date: '',
    slotId: null,
    partner: null, // "Lead For" (backoffice) — reference row
    remarks: '',
  }));
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  // fetch-lead result for the current mobile: { status: 'idle'|'checking'|'found'|'new'|'blocked'|'failed', message }
  const [match, setMatch] = useState({ status: 'idle', message: '' });
  const lookupSeq = useRef(0);
  const filledFromLead = useRef(false);
  const existing = match.status === 'found';
  const blocked = match.status === 'blocked';

  useEffect(() => {
    if (projects.status === 'idle') dispatch(fetchProjects({ page: 1 }));
  }, [dispatch, projects.status]);

  // Pre-select the lead's project, or the only project.
  useEffect(() => {
    if (form.projectId || !projects.items.length) return;
    const match = lead ? projects.items.find((p) => p.name === lead.project_name) : null;
    const only = projects.items.length === 1 ? projects.items[0] : null;
    if (match || only) setForm((f) => ({ ...f, projectId: (match || only).id }));
  }, [projects.items, lead, form.projectId]);

  // Look the mobile up once it has 10 digits; a changed number unlocks the form.
  useEffect(() => {
    const seq = (lookupSeq.current += 1);
    if (form.mobile.length !== 10) {
      // Details filled from another number's lead must not carry over.
      if (filledFromLead.current) setForm((f) => ({ ...f, fullName: '', email: '', partner: null }));
      filledFromLead.current = false;
      setMatch({ status: 'idle', message: '' });
      return;
    }
    setMatch({ status: 'checking', message: '' });
    dispatch(lookupVisitLead(form.mobile))
      .unwrap()
      .then((res) => {
        if (seq !== lookupSeq.current) return;
        if (res.blocked) {
          setMatch({ status: 'blocked', message: res.blocked });
          return;
        }
        const found = res.lead;
        if (!found) {
          setMatch({ status: 'new', message: '' });
          return;
        }
        filledFromLead.current = true;
        setMatch({ status: 'found', message: 'Existing lead found — details filled in.' });
        setForm((f) => ({
          ...f,
          fullName: found.full_name || [found.first_name, found.last_name].filter(Boolean).join(' ') || f.fullName,
          email: found.email && !isMasked(found.email) ? found.email : '',
          address: found.address || f.address,
          city: found.city || f.city,
          state: found.state || f.state,
          projectId: found.project_id || f.projectId,
          leadType: ['hot', 'warm', 'cold'].includes(found.lead_type) ? found.lead_type : f.leadType,
          remarks: f.remarks || found.remarks || '',
          partner: found.partner_id ? { id: found.partner_id, name: `Partner #${found.partner_id}` } : null,
        }));
        // There is no reference lookup by id; find the row to show its name.
        if (found.partner_id && isStaff) {
          dispatch(findReference({ id: found.partner_id }))
            .unwrap()
            .then((row) => {
              if (row && seq === lookupSeq.current) setForm((f) => ({ ...f, partner: row }));
            })
            .catch(() => {});
        }
      })
      .catch((message) => {
        if (seq === lookupSeq.current) setMatch({ status: 'failed', message: String(message) });
      });
  }, [dispatch, form.mobile, isStaff]);

  const projectOptions = useMemo(() => projects.items.map((p) => ({ label: p.name, value: p.id })), [projects.items]);
  const slotOptions = useMemo(
    () => (timeSlots.items || []).map((t) => ({ label: t.formatted_slot, value: t.id })),
    [timeSlots.items]
  );

  const create = async () => {
    if (blocked) return Alert.alert('Mobile number', match.message);
    if (match.status === 'checking') return Alert.alert('Please wait', 'Checking this mobile number…');
    if (!form.fullName.trim()) return Alert.alert('Name required', 'Please enter the visitor name.');
    if (form.mobile.length !== 10) return Alert.alert('Mobile number', 'Please enter a 10-digit mobile number.');
    if (!form.projectId) return Alert.alert('Project', 'Please select a project.');
    if (!form.date) return Alert.alert('Visit date', 'Please select the visit date.');
    if (!form.slotId) return Alert.alert('Time slot', 'Please select a time slot.');

    setSaving(true);
    try {
      const visit = await dispatch(
        scheduleVisit({
          full_name: form.fullName.trim(),
          mobile: form.mobile,
          project_id: form.projectId,
          lead_type: form.leadType,
          visit_date: toApiDate(form.date),
          time_slot_id: form.slotId,
          // An existing lead keeps its email: leave it out.
          email: existing ? undefined : form.email.trim() || undefined,
          address: form.address.trim() || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          remarks: form.remarks.trim() || undefined,
          partner_id: isStaff ? form.partner?.id : undefined,
        })
      ).unwrap();
      Alert.alert('Visit scheduled', `${form.fullName.trim()}'s visit has been scheduled.`, [
        { text: 'OK', onPress: () => (visit?.id ? navigation.replace('VisitDetail', { id: visit.id }) : navigation.goBack()) },
      ]);
    } catch (message) {
      Alert.alert('Could not schedule visit', String(message));
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <Screen
      showBack
      keyboardAction={<PrimaryButton label="Create Visit" iconRight="arrow-right" onPress={create} loading={saving} disabled={blocked} />}
    >
      <PageTitle>Schedule Project Visit</PageTitle>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
        <View>
          <TextField
            icon="phone"
            placeholder="Mobile Number (10 digits)"
            value={form.mobile}
            onChangeText={(v) => set('mobile')(digits(v, 10))}
            keyboardType="number-pad"
            maxLength={10}
            error={blocked ? match.message : undefined}
          />
          {match.status === 'checking' ? (
            <View style={s.hintRow}>
              <ActivityIndicator size="small" color={colors.brandPrimary} />
              <Text style={s.hint}>Checking for an existing lead…</Text>
            </View>
          ) : null}
          {existing ? (
            <View style={s.hintRow}>
              <Icon name="circle-check" size={14} color={colors.success} />
              <Text style={s.hint}>{match.message}</Text>
            </View>
          ) : null}
          {match.status === 'failed' ? <Text style={[s.hint, { color: colors.error }]}>{match.message}</Text> : null}
        </View>

        <TextField
          icon="user"
          placeholder="Enter customer's complete name"
          value={form.fullName}
          onChangeText={set('fullName')}
          maxLength={200}
          disabled={existing}
        />
        <TextField
          icon="mail"
          placeholder={existing ? 'Email (kept from the existing lead)' : 'Enter email address'}
          value={form.email}
          onChangeText={set('email')}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={existing}
        />

        {isStaff ? (
          <ReferencePicker
            pickerKey="visitLeadFor"
            icon="users"
            placeholder="Lead For (optional)"
            sheetTitle="Lead For"
            value={form.partner}
            onChange={set('partner')}
            disabled={existing}
          />
        ) : null}

        <TextField icon="map-pin" placeholder="Enter complete address" value={form.address} onChangeText={set('address')} />

        <StateCityFields
          row
          state={form.state}
          city={form.city}
          onChange={({ state, city }) => setForm((f) => ({ ...f, state, city }))}
        />

        <SelectField
          icon="building"
          placeholder={projects.status === 'loading' ? 'Loading projects…' : 'Select project'}
          value={projectOptions.find((o) => o.value === form.projectId)?.label || ''}
          options={projectOptions}
          onChange={set('projectId')}
        />

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {leadTypes.map((t) => {
            const active = form.leadType === t.id;
            const tone = TYPE_TONE[t.id];
            return (
              <Pressable
                key={t.id}
                onPress={() => set('leadType')(t.id)}
                style={[s.typeChip, { backgroundColor: active ? tone.bg : colors.surfaceSecondary }, active && { borderColor: tone.fg }]}
              >
                <Icon name={t.icon} size={14} color={active ? tone.fg : colors.muted} />
                <Text style={[s.typeLabel, active && { color: tone.fg }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <DateField placeholder="Select visit date" value={form.date} onChange={set('date')} />
        <SelectField
          icon="clock"
          placeholder={timeSlots.status === 'loading' ? 'Loading time slots…' : 'Time slot'}
          sheetTitle="Time Slot"
          value={slotOptions.find((o) => o.value === form.slotId)?.label || ''}
          options={slotOptions}
          onChange={set('slotId')}
        />
        {timeSlots.status === 'failed' ? (
          <Text style={s.error} onPress={timeSlots.reload}>{`Couldn't load time slots. Tap to retry.`}</Text>
        ) : null}

        <TextField
          icon="file-text"
          placeholder="Enter any special requirements or notes here..."
          value={form.remarks}
          onChangeText={set('remarks')}
          multiline
          maxLength={500}
        />

        <PrimaryButton
          label="Create Visit"
          iconRight="arrow-right"
          onPress={create}
          loading={saving}
          disabled={blocked}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  typeChip: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  typeLabel: { ...type.caption, color: colors.muted },
  error: { ...type.caption, color: colors.error },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  hint: { ...type.caption, color: colors.muted, marginTop: spacing.xs },
});
