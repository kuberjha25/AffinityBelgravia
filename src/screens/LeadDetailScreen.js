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
import { leadTypes, leadUpdateStatuses } from '../data';
import { fromApiDate, humanize, isMasked, orDash, rupees, toApiDate, todayApiDate } from '../format';
import { usePermissions } from '../store';
import { addFollowup, fetchLead, updateLead } from '../store/slices/leadsSlice';

/**
 * Figma frames: `lead-detail-screen` (12:2135) and the
 * `lead-update-popup` overlay (12:2415).
 * CP / Broker / Influencer / Freelancer: view only (#2). Staff: edit, update
 * status, add follow-up notes and schedule a visit (#3).
 */
export default function LeadDetailScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const id = route.params?.id;
  const lead = useSelector((state) => state.leads.details[id]);
  const status = useSelector((state) => state.leads.detailsStatus[id]);
  const error = useSelector((state) => state.leads.detailsError[id]);
  const { can } = usePermissions();
  const canEdit = can('lead.edit');

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ type: '', status: '', followUpDate: '', note: '' });

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

  const openUpdate = () => {
    setDraft({ type: lead.lead_type || '', status: lead.status || '', followUpDate: '', note: '' });
    setOpen(true);
  };

  /**
   * A note (with an optional follow-up date) is saved as a follow-up, which
   * also carries the status / type change; without a note, the lead is updated.
   */
  const save = async () => {
    if (draft.followUpDate && !draft.note.trim()) {
      Alert.alert('Add a note', 'Please add a note for the follow-up.');
      return;
    }
    // Only send what changed: statuses the backend sets itself (e.g. booked) are rejected on update.
    const changes = {};
    if (draft.status && draft.status !== lead.status) changes.status = draft.status;
    if (draft.type && draft.type !== lead.lead_type) changes.lead_type = draft.type;
    if (!draft.note.trim() && !Object.keys(changes).length) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      if (draft.note.trim()) {
        await dispatch(
          addFollowup({
            id: lead.id,
            body: {
              followup_date: toApiDate(draft.followUpDate) || todayApiDate(),
              remarks: draft.note.trim(),
              ...changes,
            },
          })
        ).unwrap();
      } else {
        await dispatch(updateLead({ id: lead.id, body: changes })).unwrap();
      }
      setOpen(false);
    } catch (message) {
      Alert.alert('Could not save', String(message));
    } finally {
      setSaving(false);
    }
  };

  const nextFollowUp = /^\d{4}-\d{2}-\d{2}/.test(lead.next_follow_up || '') ? fromApiDate(lead.next_follow_up) : lead.next_follow_up;
  const callable = lead.mobile && !isMasked(lead.mobile);
  const mailable = lead.email && !isMasked(lead.email);
  const history = lead.history || [];
  const statusOptions = leadUpdateStatuses.map((v) => ({ label: humanize(v), value: v }));

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
              value={orDash(lead.mobile)}
              onPress={callable ? () => Linking.openURL(`tel:${lead.mobile}`) : undefined}
            />
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
              <View key={`${h.date}-${i}`} style={s.historyRow}>
                <View style={{ width: 86 }}>
                  <Text style={s.histDate}>{fromApiDate(h.date)}</Text>
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
              <Pressable onPress={openUpdate} hitSlop={8}>
                <Text style={s.addNote}>Add Note</Text>
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
              <SecondaryButton label="Update Status" onPress={openUpdate} style={{ flex: 1 }} />
            </View>
            <SecondaryButton label="Edit Lead" icon="edit" onPress={() => navigation.navigate('NewLead', { id: lead.id })} />
          </>
        ) : (
          <Text style={s.viewOnly}>View only. Contact the Affinity Belgravia sales team to update this lead.</Text>
        )}
      </View>

      <CenterDialog visible={open} onClose={() => setOpen(false)} title="Update Lead">
        <View>
          <Text style={s.fieldLabel}>Lead Type</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {leadTypes.map((t) => {
              const active = draft.type === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setDraft((d) => ({ ...d, type: t.id }))}
                  style={[s.typeChip, active && s.typeChipActive]}
                >
                  <Text style={[s.typeChipLabel, active && { color: colors.onBrand }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <SelectField
          label="Lead Status"
          value={draft.status ? humanize(draft.status) : ''}
          placeholder="Select status"
          options={statusOptions}
          onChange={(v) => setDraft((d) => ({ ...d, status: v }))}
        />

        <DateField
          label="Follow-up Date"
          placeholder={`Today (${formatDate(new Date())})`}
          value={draft.followUpDate}
          onChange={(v) => setDraft((d) => ({ ...d, followUpDate: v }))}
        />

        <TextField
          label="Notes"
          placeholder="Add notes about this lead..."
          value={draft.note}
          onChangeText={(v) => setDraft((d) => ({ ...d, note: v }))}
          multiline
          maxLength={500}
        />

        <PrimaryButton label="Save Update" onPress={save} loading={saving} />
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
  rail: { width: 10, alignItems: 'center', paddingTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandPrimary },
  line: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 4 },
  histTitle: { ...type.body, color: colors.onSurface },
  histDetail: { ...type.bodySmall, color: colors.muted, marginTop: 2 },
  byRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  histBy: { ...type.caption, color: colors.muted },

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
