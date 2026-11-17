import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import { Card, Divider, KeyValue, StatusPill, toneForStatus, LoadingState, ErrorState } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { fromUtcDateTime, humanize, orDash } from '../format';
import { fetchRequest } from '../store/slices/requestsSlice';
import { priorityTone } from './RequestsScreen';

/**
 * A partner request (GET /partner-requests/{id}): its details and the
 * timeline — the partner's own note first, then Admin replies.
 */
export default function RequestDetailScreen({ route }) {
  const dispatch = useDispatch();
  const id = route.params?.id;
  const req = useSelector((state) => state.requests.details[id]);
  const status = useSelector((state) => state.requests.detailsStatus[id]);
  const error = useSelector((state) => state.requests.detailsError[id]);

  useEffect(() => {
    if (id) dispatch(fetchRequest(id));
  }, [dispatch, id]);

  if (!req) {
    return (
      <Screen showBack>
        <PageTitle>Request</PageTitle>
        {status === 'failed' ? <ErrorState message={error} onRetry={() => dispatch(fetchRequest(id))} /> : <LoadingState />}
      </Screen>
    );
  }

  const history = req.history || [];

  return (
    <Screen showBack onRefresh={() => dispatch(fetchRequest(id))}>
      <PageTitle subtitle={req.type}>{req.reference_id || `Request #${req.id}`}</PageTitle>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
        <Card>
          <View style={s.pillRow}>
            <StatusPill label={humanize(req.status)} tone={toneForStatus(req.status)} />
            <StatusPill label={`${humanize(req.priority)} priority`} tone={priorityTone(req.priority)} />
            {req.is_overdue ? <StatusPill label="Overdue" tone="error" /> : null}
          </View>
          <Divider style={{ marginVertical: spacing.lg }} />
          <View style={{ gap: spacing.lg }}>
            <KeyValue icon="building" label="Project" value={orDash(req.project_name)} />
            <KeyValue icon="shopping-bag" label="Unit" value={orDash(req.unit_number)} />
            <KeyValue icon="user" label="Assigned To" value={orDash(req.assigned_to)} />
            <KeyValue icon="clock" label="Response Due" value={req.tat_deadline ? fromUtcDateTime(req.tat_deadline) : '—'} />
          </View>
        </Card>

        <Card>
          <Text style={s.cardTitle}>Timeline</Text>
          <View style={{ marginTop: spacing.lg }}>
            {history.map((h, i) => (
              <View key={h.id ?? i} style={s.row}>
                <View style={s.rail}>
                  <View style={s.dot} />
                  {i < history.length - 1 ? <View style={s.line} /> : null}
                </View>
                <View style={{ flex: 1, paddingBottom: spacing.xl }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Text style={s.who} numberOfLines={1}>{h.user_name || '—'}</Text>
                    {h.status ? <StatusPill label={humanize(h.status)} tone={toneForStatus(h.status)} /> : null}
                  </View>
                  <Text style={s.when}>{fromUtcDateTime(h.date)}</Text>
                  {h.remarks ? <Text style={s.remarks}>{h.remarks}</Text> : null}
                  {h.attachment ? (
                    <Pressable onPress={() => Linking.openURL(h.attachment)} hitSlop={8} style={s.attachment}>
                      <Icon name="file-text" size={14} color={colors.brandPrimary} />
                      <Text style={s.attachmentLabel}>View attachment</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}
            {history.length === 0 ? <Text style={s.remarks}>No updates yet.</Text> : null}
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cardTitle: { ...type.heading, color: colors.onSurface },
  row: { flexDirection: 'row', gap: spacing.md },
  rail: { width: 10, alignItems: 'center', paddingTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandPrimary },
  line: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 4 },
  who: { ...type.body, color: colors.onSurface, flexShrink: 1 },
  when: { ...type.caption, color: colors.muted, marginTop: 2 },
  remarks: { ...type.bodySmall, color: colors.onSurfaceTertiary, marginTop: spacing.sm, lineHeight: 20 },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.glassTint,
  },
  attachmentLabel: { ...type.caption, color: colors.brandPrimary },
});
