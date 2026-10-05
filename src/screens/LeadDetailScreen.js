import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
} from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { leadStatuses, leadTypes } from '../data';
import { useApp } from '../store';

/**
 * Figma frames: `lead-detail-screen` (12:2135) and the
 * `lead-update-popup` overlay (12:2415).
 */
export default function LeadDetailScreen({ navigation, route }) {
  const { leads, updateLead } = useApp();
  const lead = leads.find((l) => l.id === route.params?.id) || leads[0];

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    type: lead.type,
    status: lead.status,
    followUpDate: lead.followUpDate,
    note: '',
  });

  const save = () => {
    updateLead(lead.id, {
      type: draft.type,
      status: draft.status,
      followUpDate: draft.followUpDate,
      ...(draft.note ? { note: draft.note } : null),
    });
    setDraft((d) => ({ ...d, note: '' }));
    setOpen(false);
  };

  return (
    <Screen showBack>
      <PageTitle>Lead Detail</PageTitle>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
        <Card>
          <Text style={s.name}>{lead.name}</Text>
          <View style={s.pillRow}>
            <StatusPill label={lead.status} tone={toneForStatus(lead.status)} />
            <StatusPill label={lead.type} tone={lead.type === 'Hot' ? 'error' : 'warning'} />
            <StatusPill label={lead.source} tone="neutral" />
          </View>
          <Divider style={{ marginVertical: spacing.lg }} />

          <View style={{ gap: spacing.lg }}>
            <ContactRow icon="phone" label="Phone" value={lead.phone} />
            <ContactRow icon="mail" label="Email" value={lead.email} />
          </View>
        </Card>

        <Card>
          <Text style={s.cardTitle}>Interest Details</Text>
          {Object.values(lead.interest || {}).some(Boolean) ? null : (
            <Text style={s.interestEmpty}>
              No interest details were captured for this lead. Add them while creating a lead.
            </Text>
          )}
          <View style={s.interestGrid}>
            {Object.entries(lead.interest || {}).filter(([, value]) => value).map(([label, value]) => (
              <View key={label} style={s.interestCell}>
                <Text style={s.interestLabel}>{label}</Text>
                <Text style={s.interestValue}>{value}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={s.cardTitle}>History</Text>
          <View style={{ marginTop: spacing.lg }}>
            {lead.history.map((h, i) => (
              <View key={h.id} style={s.historyRow}>
                <View style={{ width: 86 }}>
                  <Text style={s.histDate}>{h.date}</Text>
                  <Text style={s.histTime}>{h.time}</Text>
                </View>
                <View style={s.rail}>
                  <View style={s.dot} />
                  {i < lead.history.length - 1 ? <View style={s.line} /> : null}
                </View>
                <View style={{ flex: 1, paddingBottom: spacing.xl }}>
                  <Text style={s.histTitle}>{h.title}</Text>
                  <Text style={s.histDetail}>{h.detail}</Text>
                  <View style={s.byRow}>
                    <Icon name="user" size={12} color={colors.muted} />
                    <Text style={s.histBy}>{h.by}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[s.cardTitle, { flex: 1 }]}>Notes</Text>
            <Pressable onPress={() => setOpen(true)} hitSlop={8}>
              <Text style={s.addNote}>Add Note</Text>
            </Pressable>
          </View>
          <View style={s.noteBox}>
            <Text style={s.noteText}>{lead.note}</Text>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <PrimaryButton
            label="Schedule Visit"
            onPress={() => navigation.navigate('ScheduleVisit')}
            style={{ flex: 1 }}
          />
          <SecondaryButton label="Update Status" onPress={() => setOpen(true)} style={{ flex: 1 }} />
        </View>
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
          value={draft.status}
          options={leadStatuses}
          onChange={(v) => setDraft((d) => ({ ...d, status: v }))}
        />

        <DateField
          label="Follow-up Date"
          value={draft.followUpDate}
          onChange={(v) => setDraft((d) => ({ ...d, followUpDate: v }))}
        />

        <TextField
          label="Notes"
          placeholder="Add notes about this lead..."
          value={draft.note}
          onChangeText={(v) => setDraft((d) => ({ ...d, note: v }))}
          multiline
        />

        <PrimaryButton label="Save Update" onPress={save} />
      </CenterDialog>
    </Screen>
  );
}

function ContactRow({ icon, label, value }) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
      <View style={s.contactIcon}>
        <Icon name={icon} size={18} color={colors.brandPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.contactLabel}>{label}</Text>
        <Text style={s.contactValue}>{value}</Text>
      </View>
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
  interestEmpty: { ...type.bodySmall, color: colors.muted, marginTop: spacing.md },

  historyRow: { flexDirection: 'row', gap: spacing.md },
  histDate: { ...type.caption, color: colors.brandPrimary },
  histTime: { ...type.caption, color: colors.onSurfaceTertiary, letterSpacing: 1, marginTop: 2 },
  rail: { width: 10, alignItems: 'center', paddingTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandPrimary },
  line: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 4 },
  histTitle: { ...type.body, color: colors.onSurface },
  histDetail: { ...type.bodySmall, color: colors.muted, marginTop: 2 },
  byRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  histBy: { ...type.caption, color: colors.muted },

  addNote: { ...type.bodySmall, color: colors.brandPrimary },
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
