import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import DateField from '../components/DateField';
import {
  Card,
  CenterDialog,
  Divider,
  PrimaryButton,
  SecondaryButton,
  SelectField,
  StatusPill,
  TextField,
  toneForStatus,
  LoadingState,
  ErrorState,
} from '../components/ui';
import { formatDate } from '../components/DateField';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { followUpActivities, leadStatusesFallback, leadStatusUpdateValues, leadTypes } from '../data';
import { fromApiDate, humanize, isMasked, lastFourAadhaar, lastFourMobile, orDash, rupees, timeLabel, toApiDate } from '../format';
import { usePermissions } from '../store';
import { addFollowup, completeFollowup, fetchLead, updateLeadStatus } from '../store/slices/leadsSlice';
import { useLeadStatuses } from '../hooks';

/** Half-hour follow-up times, 9 AM – 8 PM, sent as "HH:mm". */
const TIME_OPTIONS = Array.from({ length: 23 }, (_, i) => {
  const mins = 9 * 60 + i * 30;
  const value = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  return { label: timeLabel(value), value };
});

const blankFollowUp = () => ({
  date: formatDate(new Date()),
  time: '',
  activity: followUpActivities[0],
  leadType: '', // '' = No Change
  remarks: '',
});

/**
 * Figma frames: `lead-detail-screen` (12:2135) and the
 * `lead-update-popup` overlay (12:2415).
 * CP / Broker / Influencer / Freelancer: view only (#2); on a converted lead
 * they can raise a request about it. Staff: edit, update status (with
 * remarks), add follow-ups, mark follow-ups complete and schedule a visit (#3).
 */
export default function LeadDetailScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const id = route.params?.id;
  const lead = useSelector((state) => state.leads.details[id]);
  const status = useSelector((state) => state.leads.detailsStatus[id]);
  const error = useSelector((state) => state.leads.detailsError[id]);
  const { can, isStaff } = usePermissions();
  const canEdit = can('lead.edit');
  const { settable: statusChoices } = useLeadStatuses();

  // One dialog at a time: 'status' | 'followup' | { complete: task }
  const [dialog, setDialog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusDraft, setStatusDraft] = useState({ status: '', remarks: '' });
  const [statusErrors, setStatusErrors] = useState({});
  const [followDraft, setFollowDraft] = useState(blankFollowUp);
  const [completeRemarks, setCompleteRemarks] = useState('');

  useEffect(() => {
    if (id) dispatch(fetchLead(id));
  }, [dispatch, id]);

  if (!lead) {
    return (
      <Screen showBack>
        <PageTitle>Lead Detail</PageTitle>
        {status === 'failed' ? (
          <ErrorState message={error} onRetry={() => dispatch(fetchLead(id))} />
        ) : (
          <LoadingState />
        )}
      </Screen>
    );
  }

  const close = () => setDialog(null);

  /** Runs a save; closes the dialog on success, alerts the API message on failure. */
  const run = async (action) => {
    setSaving(true);
    try {
      await dispatch(action).unwrap();
      close();
    } catch (message) {
      Alert.alert('Could not save', String(message));
    } finally {
      setSaving(false);
    }
  };

  const openStatus = () => {
    setStatusDraft({ status: '', remarks: '' });
    setStatusErrors({});
    setDialog('status');
  };

  /** PATCH /leads/{id}/status — `status` from the allowed list, `remarks` min 3 characters. */
  const saveStatus = async () => {
    const remarks = statusDraft.remarks.trim();
    const errors = {};
    if (!statusDraft.status) errors.status = 'Please choose the new status.';
    else if (!leadStatusUpdateValues.includes(statusDraft.status)) errors.status = 'This status cannot be set here.';
    if (remarks.length < 3) errors.remarks = 'Remarks must be at least 3 characters.';
    setStatusErrors(errors);
    if (Object.keys(errors).length) return;

    setSaving(true);
    try {
      const action = await dispatch(updateLeadStatus({ id, status: statusDraft.status, remarks }));
      if (updateLeadStatus.rejected.match(action)) {
        const fe = action.meta.fieldErrors || {};
        const first = (v) => (Array.isArray(v) ? v[0] : v) || undefined;
        if (fe.status || fe.remarks) setStatusErrors({ status: first(fe.status), remarks: first(fe.remarks) });
        else Alert.alert('Could not update status', String(action.payload));
        return;
      }
      close();
    } finally {
      setSaving(false);
    }
  };

  const openFollowUp = () => {
    setFollowDraft(blankFollowUp());
    setDialog('followup');
  };

  /** POST /leads/{id}/followups — `lead_type` only when changed, never `status`. */
  const saveFollowUp = () => {
    if (!followDraft.date) return Alert.alert('Follow-up date', 'Please select the follow-up date.');
    if (!followDraft.remarks.trim()) return Alert.alert('Remarks required', 'Please add a note for this follow-up.');
    const body = {
      followup_date: toApiDate(followDraft.date),
      followup_time: followDraft.time || undefined,
      activity: followDraft.activity || undefined,
      remarks: followDraft.remarks.trim(),
    };
    if (followDraft.leadType && followDraft.leadType !== lead.lead_type) body.lead_type = followDraft.leadType;
    return run(addFollowup({ id: lead.id, body }));
  };

  const openComplete = (task) => {
    setCompleteRemarks('');
    setDialog({ complete: task });
  };

  const saveComplete = () => {
    if (!completeRemarks.trim()) return Alert.alert('Remarks required', 'Please add a note on how the follow-up went.');
    return run(completeFollowup({ id: lead.id, followupId: dialog.complete.id, remarks: completeRemarks.trim() }));
  };

  const nextFollowUp = /^\d{4}-\d{2}-\d{2}/.test(lead.next_follow_up || '') ? fromApiDate(lead.next_follow_up) : lead.next_follow_up;
  // Frontend users (CP / Broker / …) see only the last 4 digits of the customer's mobile and Aadhaar.
  const mobileText = isStaff ? orDash(lead.mobile) : lastFourMobile(lead.mobile);
  const callable = isStaff && lead.mobile && !isMasked(lead.mobile);
  const mailable = lead.email && !isMasked(lead.email);
  const history = lead.history || [];
  // Only the statuses PATCH /leads/{id}/status accepts; fall back to the local list if the API gave none of them.
  const allowedChoices = statusChoices.filter((st) => leadStatusUpdateValues.includes(st.id));
  const statusSource = allowedChoices.length
    ? allowedChoices
    : statusChoices.length
      ? leadStatusesFallback.map((st) => ({ id: st.id, label: st.name }))
      : [];
  const statusOptions = statusSource.filter((st) => st.id !== lead.status).map((st) => ({ label: st.label, value: st.id }));
  const statusLabel = statusSource.find((st) => st.id === statusDraft.status)?.label || '';
  const canRaiseRequest = !isStaff && lead.status === 'converted';
  const task = dialog?.complete;

  return (
    <Screen showBack refreshing={false} onRefresh={() => dispatch(fetchLead(id))}>
      <PageTitle>Lead Detail</PageTitle>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
        <Card>
          <Text style={s.name}>{lead.full_name}</Text>
          <View style={s.pillRow}>
            <StatusPill label={humanize(lead.status)} tone={toneForStatus(lead.status)} />
            {lead.lead_type ? (
              <StatusPill label={humanize(lead.lead_type)} tone={lead.lead_type === 'hot' ? 'error' : 'warning'} />
            ) : null}
            {lead.source ? <StatusPill label={lead.source} tone="neutral" /> : null}
          </View>
          <Divider style={{ marginVertical: spacing.lg }} />

          <View style={{ gap: spacing.lg }}>
            <ContactRow
              icon="phone"
              label="Mobile"
              value={mobileText}
              onPress={callable ? () => Linking.openURL(`tel:${lead.mobile}`) : undefined}
            />
            {!isStaff ? <ContactRow icon="hash" label="Aadhaar (last 4)" value={lastFourAadhaar(lead.aadhaar_last_four)} /> : null}
            {lead.email ? (
              <ContactRow
                icon="mail"
                label="Email"
                value={lead.email}
                onPress={mailable ? () => Linking.openURL(`mailto:${lead.email}`) : undefined}
              />
            ) : null}
            <ContactRow icon="briefcase" label="Assigned Staff" value={orDash(lead.assigned_to)} />
          </View>
        </Card>

        <Card>
          <Text style={s.cardTitle}>Interest Details</Text>
          <View style={s.interestGrid}>
            <Cell label="Project" value={orDash(lead.project_name)} />
            <Cell label="Configuration" value={orDash(lead.unit_category)} />
            <Cell label="Budget" value={rupees(lead.budget) || orDash(lead.budget)} />
            <Cell label="Next Follow-up" value={orDash(nextFollowUp)} />
            {lead.visit_date ? (
              <Cell label="Site Visit" value={`${fromApiDate(lead.visit_date)}${lead.visit_time ? `, ${lead.visit_time}` : ''}`} />
            ) : null}
          </View>
        </Card>

        <Card>
          <Text style={s.cardTitle}>History</Text>
          <View style={{ marginTop: spacing.lg }}>
            {history.map((h, i) => (
              <View key={h.id ? `${h.type}-${h.id}` : `${h.date}-${i}`} style={s.historyRow}>
                <View style={{ width: 86 }}>
                  <Text style={s.histDate}>{fromApiDate(h.date)}</Text>
                  {h.time ? <Text style={s.histTime}>{timeLabel(h.time)}</Text> : null}
                </View>
                <View style={s.rail}>
                  <View style={s.dot} />
                  {i < history.length - 1 ? <View style={s.line} /> : null}
                </View>
                <View style={{ flex: 1, paddingBottom: spacing.xl }}>
                  <Text style={s.histTitle}>{h.activity}</Text>
                  {h.remarks ? <Text style={s.histDetail}>{h.remarks}</Text> : null}
                  {h.user_name ? (
                    <View style={s.byRow}>
                      <Icon name="user" size={12} color={colors.muted} />
                      <Text style={s.histBy}>{h.user_name}</Text>
                    </View>
                  ) : null}
                  {h.type === 'task' && h.is_completed ? (
                    <View style={{ marginTop: spacing.sm }}>
                      <View style={s.byRow}>
                        <Icon name="circle-check" size={12} color={colors.success} />
                        <Text style={s.doneLabel}>Completed</Text>
                      </View>
                      {h.completion_remarks ? <Text style={s.histDetail}>{h.completion_remarks}</Text> : null}
                    </View>
                  ) : null}
                  {h.type === 'task' && !h.is_completed && h.id ? (
                    canEdit ? (
                      <Pressable onPress={() => openComplete(h)} hitSlop={8} style={s.completeBtn}>
                        <Icon name="check" size={12} color={colors.brandPrimary} />
                        <Text style={s.completeLabel}>Mark Complete</Text>
                      </Pressable>
                    ) : (
                      <Text style={s.pendingLabel}>Pending</Text>
                    )
                  ) : null}
                </View>
              </View>
            ))}
            {history.length === 0 ? <Text style={s.histDetail}>No activity yet.</Text> : null}
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[s.cardTitle, { flex: 1 }]}>Remarks</Text>
            {canEdit ? (
              <Pressable onPress={openFollowUp} hitSlop={8}>
                <Text style={s.addNote}>Add Follow-up</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={s.noteBox}>
            <Text style={s.noteText}>{lead.remarks || 'No remarks added yet.'}</Text>
          </View>
        </Card>

        {canEdit ? (
          <>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <PrimaryButton
                label="Schedule Visit"
                onPress={() => navigation.navigate('ScheduleVisit', { leadId: lead.id })}
                style={{ flex: 1 }}
              />
              <SecondaryButton label="Update Status" onPress={openStatus} style={{ flex: 1 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <SecondaryButton label="Add Follow-up" icon="calendar" onPress={openFollowUp} style={{ flex: 1 }} />
              <SecondaryButton
                label="Edit Lead"
                icon="edit"
                onPress={() => navigation.navigate('NewLead', { id: lead.id })}
                style={{ flex: 1 }}
              />
            </View>
          </>
        ) : (
          <>
            {canRaiseRequest ? (
              <PrimaryButton
                label="Raise Request"
                icon="notepad-text"
                onPress={() =>
                  navigation.navigate('NewRequest', { remarks: `Lead: ${lead.full_name} (${mobileText})\n` })
                }
              />
            ) : null}
            <Text style={s.viewOnly}>View only. Contact the Affinity Belgravia sales team to update this lead.</Text>
          </>
        )}
      </View>

      <CenterDialog visible={dialog === 'status'} onClose={close} title="Update Status">
        <Text style={s.fieldLabel}>{`Current: ${humanize(lead.status)}`}</Text>
        <SelectField
          label="New Status"
          value={statusLabel}
          placeholder={statusOptions.length ? 'Select status' : 'Loading statuses…'}
          options={statusOptions}
          onChange={(v) => {
            setStatusDraft((d) => ({ ...d, status: v }));
            setStatusErrors((e) => ({ ...e, status: undefined }));
          }}
          error={statusErrors.status}
        />
        <TextField
          label="Remarks (required, min 3 characters)"
          placeholder="Why is the status changing?"
          value={statusDraft.remarks}
          onChangeText={(v) => {
            setStatusDraft((d) => ({ ...d, remarks: v }));
            if (statusErrors.remarks && v.trim().length >= 3) setStatusErrors((e) => ({ ...e, remarks: undefined }));
          }}
          error={statusErrors.remarks}
          multiline
          maxLength={500}
        />
        <PrimaryButton label="Update Status" onPress={saveStatus} loading={saving} />
      </CenterDialog>

      <CenterDialog visible={dialog === 'followup'} onClose={close} title="Add Follow-up">
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <DateField
            label="Date"
            placeholder="Select date"
            value={followDraft.date}
            onChange={(v) => setFollowDraft((d) => ({ ...d, date: v }))}
            style={{ flex: 1 }}
          />
          <SelectField
            label="Time"
            placeholder="Optional"
            value={followDraft.time ? timeLabel(followDraft.time) : ''}
            options={TIME_OPTIONS}
            onChange={(v) => setFollowDraft((d) => ({ ...d, time: v }))}
            sheetTitle="Follow-up Time"
            style={{ flex: 1 }}
          />
        </View>
        <SelectField
          label="Activity"
          value={followDraft.activity}
          options={followUpActivities}
          onChange={(v) => setFollowDraft((d) => ({ ...d, activity: v }))}
        />
        <View>
          <Text style={s.fieldLabel}>Lead Type</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            {[{ id: '', label: 'No Change' }, ...leadTypes].map((t) => {
              const active = followDraft.leadType === t.id;
              return (
                <Pressable
                  key={t.id || 'none'}
                  onPress={() => setFollowDraft((d) => ({ ...d, leadType: t.id }))}
                  style={[s.typeChip, active && s.typeChipActive]}
                >
                  <Text style={[s.typeChipLabel, active && { color: colors.onBrand }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <TextField
          label="Remarks (required)"
          placeholder="Add notes about this follow-up..."
          value={followDraft.remarks}
          onChangeText={(v) => setFollowDraft((d) => ({ ...d, remarks: v }))}
          multiline
          maxLength={500}
        />
        <PrimaryButton label="Save Follow-up" onPress={saveFollowUp} loading={saving} />
      </CenterDialog>

      <CenterDialog visible={Boolean(task)} onClose={close} title="Complete Follow-up">
        {task ? (
          <Text style={s.fieldLabel}>
            {[task.activity, fromApiDate(task.date), task.time ? timeLabel(task.time) : null].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
        <TextField
          label="Outcome (required)"
          placeholder="e.g. Client answered, wants to visit next week."
          value={completeRemarks}
          onChangeText={setCompleteRemarks}
          multiline
          maxLength={500}
        />
        <PrimaryButton label="Mark Complete" onPress={saveComplete} loading={saving} />
      </CenterDialog>
    </Screen>
  );
}

function ContactRow({ icon, label, value, onPress }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
      <View style={s.contactIcon}>
        <Icon name={icon} size={18} color={colors.brandPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.contactLabel}>{label}</Text>
        <Text style={[s.contactValue, onPress && { color: colors.brandPrimary }]}>{value}</Text>
      </View>
    </Pressable>
  );
}

function Cell({ label, value }) {
  return (
    <View style={s.interestCell}>
      <Text style={s.interestLabel}>{label}</Text>
      <Text style={s.interestValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  name: { ...type.heading, color: colors.onSurface },
  pillRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  cardTitle: { ...type.heading, color: colors.onSurface },

  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.glassTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: { ...type.caption, color: colors.muted },
  contactValue: { ...type.body, color: colors.onSurface, marginTop: 2 },

  interestGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.lg },
  interestCell: { width: '50%', paddingBottom: spacing.lg, paddingRight: spacing.md },
  interestLabel: { ...type.caption, color: colors.brandPrimary },
  interestValue: { ...type.body, color: colors.onSurface, marginTop: 2 },

  historyRow: { flexDirection: 'row', gap: spacing.md },
  histDate: { ...type.caption, color: colors.brandPrimary },
  histTime: { ...type.caption, color: colors.muted, marginTop: 2 },
  rail: { width: 10, alignItems: 'center', paddingTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandPrimary },
  line: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 4 },
  histTitle: { ...type.body, color: colors.onSurface },
  histDetail: { ...type.bodySmall, color: colors.muted, marginTop: 2 },
  byRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  histBy: { ...type.caption, color: colors.muted },
  doneLabel: { ...type.caption, color: colors.success },
  pendingLabel: { ...type.caption, color: colors.brandPrimary, marginTop: spacing.sm },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: borderWidth.default,
    borderColor: colors.brandPrimary,
  },
  completeLabel: { ...type.caption, color: colors.brandPrimary },

  addNote: { ...type.bodySmall, color: colors.brandPrimary },
  viewOnly: { ...type.caption, color: colors.muted, textAlign: 'center' },
  noteBox: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  noteText: { ...type.bodySmall, color: colors.onSurfaceTertiary, lineHeight: 22 },

  fieldLabel: { ...type.caption, color: colors.onSurfaceTertiary, marginBottom: spacing.sm },
  typeChip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  typeChipLabel: { ...type.bodySmall, color: colors.onSurfaceTertiary },
});
