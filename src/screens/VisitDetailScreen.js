import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Linking, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import {
  Card,
  Divider,
  KeyValue,
  PrimaryButton,
  StatusPill,
  TextField,
  toneForStatus,
  LoadingState,
  ErrorState,
} from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { fromApiDate, humanize, isMasked, orDash } from '../format';
import { usePermissions } from '../store';
import { attendVisit, fetchVisit } from '../store/slices/visitsSlice';

/** Figma frame: `visit-detail-screen` (12:1020). Staff can mark a visit attended. */
export default function VisitDetailScreen({ route }) {
  const dispatch = useDispatch();
  const id = route.params?.id;
  const visit = useSelector((state) => state.visits.details[id]);
  const status = useSelector((state) => state.visits.detailsStatus[id]);
  const error = useSelector((state) => state.visits.detailsError[id]);
  const { can } = usePermissions();
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchVisit(id));
  }, [dispatch, id]);

  if (!visit) {
    return (
      <Screen showBack>
        <PageTitle>Project Visit Details</PageTitle>
        {status === 'failed' ? <ErrorState message={error} onRetry={() => dispatch(fetchVisit(id))} /> : <LoadingState />}
      </Screen>
    );
  }

  const open = ['scheduled', 'in_progress'].includes(visit.status);
  const canAttend = can('visit.updateStatus') && open;

  const markAttended = async () => {
    if (!remarks.trim()) {
      Alert.alert('Remarks', 'Please add a note about how the visit went.');
      return;
    }
    setSaving(true);
    try {
      await dispatch(attendVisit({ id: visit.id, remarks: remarks.trim() })).unwrap();
      setRemarks('');
      Alert.alert('Visit updated', 'The visit has been marked as attended.');
    } catch (message) {
      Alert.alert('Could not update visit', String(message));
    } finally {
      setSaving(false);
    }
  };

  const callable = visit.mobile && !isMasked(visit.mobile);
  const mailable = visit.email && !isMasked(visit.email);

  return (
    <Screen showBack onRefresh={() => dispatch(fetchVisit(id))}>
      <PageTitle>Project Visit Details</PageTitle>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Text style={[s.name, { flex: 1 }]}>{visit.visitor_name}</Text>
            <StatusPill label={humanize(visit.status)} tone={toneForStatus(visit.status)} />
          </View>
          <Divider style={{ marginVertical: spacing.md }} />

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, gap: spacing.md, paddingRight: spacing.md }}>
              <Pressable
                style={s.inline}
                disabled={!callable}
                onPress={() => Linking.openURL(`tel:${visit.mobile}`)}
              >
                <Icon name="phone" size={16} color={colors.brandPrimary} />
                <Text style={[s.contact, callable && { color: colors.brandPrimary }]} numberOfLines={1}>
                  {orDash(visit.mobile)}
                </Text>
              </Pressable>
              <Pressable
                style={s.inline}
                disabled={!mailable}
                onPress={() => Linking.openURL(`mailto:${visit.email}`)}
              >
                <Icon name="mail" size={16} color={colors.brandPrimary} />
                <Text style={[s.contact, mailable && { color: colors.brandPrimary }]} numberOfLines={1}>
                  {orDash(visit.email)}
                </Text>
              </Pressable>
            </View>

            <View style={s.vRule} />

            <View style={{ flex: 1, gap: spacing.md, paddingLeft: spacing.lg }}>
              <View>
                <View style={s.inline}>
                  <Icon name="flame" size={14} color={colors.brandPrimary} />
                  <Text style={s.kvLabel}>Lead Type</Text>
                </View>
                <StatusPill
                  label={visit.lead_type ? humanize(visit.lead_type).toUpperCase() : '—'}
                  tone={visit.lead_type === 'hot' ? 'warning' : 'neutral'}
                  style={{ marginTop: 4 }}
                  textStyle={{ letterSpacing: 1 }}
                />
              </View>
              <View>
                <View style={s.inline}>
                  <Icon name="home" size={14} color={colors.brandPrimary} />
                  <Text style={s.kvLabel}>Project</Text>
                </View>
                <Text style={s.kvValue} numberOfLines={1}>{orDash(visit.project_name)}</Text>
              </View>
              <View>
                <View style={s.inline}>
                  <Icon name="user" size={14} color={colors.brandPrimary} />
                  <Text style={s.kvLabel}>Booked By</Text>
                </View>
                <Text style={s.kvValue}>{orDash(visit.booked_by)}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={{ flexDirection: 'row', gap: spacing.lg }}>
          <KeyValue label="Visit Date" value={fromApiDate(visit.visit_date) || '—'} icon="calendar" style={{ flex: 1 }} compact />
          <KeyValue label="Visit Time" value={orDash(visit.visit_time)} icon="clock" style={{ flex: 1.3 }} compact />
        </Card>

        <Card style={{ flexDirection: 'row', gap: spacing.lg }}>
          <KeyValue label="Assigned Staff" value={orDash(visit.assigned_to === 'Unassigned' ? null : visit.assigned_to)} icon="briefcase" style={{ flex: 1 }} compact />
          <KeyValue label="Visit Type" value={visit.visit_type && visit.visit_type !== '-' ? humanize(visit.visit_type) : '—'} icon="users" style={{ flex: 1 }} compact />
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={s.noteIcon}>
              <Icon name="notepad-text" size={18} color={colors.brandPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.noteTitle}>Visit Notes</Text>
              <Text style={s.noteBody}>{visit.remarks || 'No notes added yet.'}</Text>
            </View>
          </View>
          {canAttend ? (
            <>
              <Divider style={{ marginVertical: spacing.lg }} />
              <TextField
                label="Visit outcome"
                placeholder="e.g. Client liked the sample flat. Will follow up next week."
                value={remarks}
                onChangeText={setRemarks}
                multiline
                maxLength={500}
              />
              <PrimaryButton
                label="Mark as Attended"
                icon="circle-check"
                onPress={markAttended}
                loading={saving}
                style={{ marginTop: spacing.md }}
              />
            </>
          ) : null}
        </Card>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  name: { ...type.body, color: colors.onSurface },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contact: { ...type.bodySmall, color: colors.onSurface, flex: 1 },
  vRule: { width: 1, backgroundColor: colors.divider },
  kvLabel: { ...type.caption, color: colors.muted },
  kvValue: { ...type.bodySmall, color: colors.onSurface, marginTop: 2 },

  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.glassTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteTitle: { ...type.body, color: colors.onSurface },
  noteBody: { ...type.bodySmall, color: colors.muted, marginTop: spacing.xs },
});
