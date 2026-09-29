import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import {
  Card,
  Divider,
  KeyValue,
  PrimaryButton,
  SelectField,
  StatusPill,
  toneForStatus,
} from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { useApp } from '../store';

/** Figma frame: `visit-detail-screen` (12:1020). */
export default function VisitDetailScreen({ route }) {
  const { visits, updateVisit } = useApp();
  const visit = visits.find((v) => v.id === route.params?.id) || visits[0];
  const [order, setOrder] = useState('Latest First');
  const [expanded, setExpanded] = useState(null);

  const history = useMemo(() => {
    const list = [...(visit.history || [])];
    return order === 'Latest First' ? list : list.reverse();
  }, [visit.history, order]);

  const endVisit = () => updateVisit(visit.id, { visitStatus: 'Completed', status: 'Completed' });
  const active = visit.visitStatus === 'In Progress';

  return (
    <Screen showBack>
      <PageTitle>Project Visits Details</PageTitle>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[s.name, { flex: 1 }]}>{visit.name}</Text>
            <StatusPill
              label={active ? 'Current Visit' : visit.visitStatus}
              tone={active ? 'success' : toneForStatus(visit.visitStatus)}
            />
          </View>
          <Divider style={{ marginVertical: spacing.md }} />

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, gap: spacing.md, paddingRight: spacing.md }}>
              <View style={s.inline}>
                <Icon name="phone-off" size={16} color={colors.brandPrimary} />
                <Text style={s.contact} numberOfLines={1}>{visit.phone}</Text>
              </View>
              <View style={s.inline}>
                <Icon name="mail" size={16} color={colors.brandPrimary} />
                <Text style={s.contact} numberOfLines={1}>{visit.email}</Text>
              </View>
            </View>

            <View style={s.vRule} />

            <View style={{ flex: 1, gap: spacing.md, paddingLeft: spacing.lg }}>
              <View>
                <View style={s.inline}>
                  <Icon name="flame" size={14} color={colors.brandPrimary} />
                  <Text style={s.kvLabel}>Lead Type</Text>
                </View>
                <StatusPill
                  label={visit.leadType}
                  tone={visit.leadType === 'HOT' ? 'warning' : 'neutral'}
                  style={{ marginTop: 4 }}
                  textStyle={{ letterSpacing: 1 }}
                />
              </View>
              <View>
                <View style={s.inline}>
                  <Icon name="home" size={14} color={colors.brandPrimary} />
                  <Text style={s.kvLabel}>Project</Text>
                </View>
                <Text style={s.kvValueSpaced} numberOfLines={1}>{visit.project}</Text>
              </View>
              <View>
                <View style={s.inline}>
                  <Icon name="user" size={14} color={colors.brandPrimary} />
                  <Text style={s.kvLabel}>Booked By</Text>
                </View>
                <Text style={s.kvValue}>{visit.bookedByType}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={{ flexDirection: 'row', gap: spacing.lg }}>
          <KeyValue label="Visit Date" value={visit.date} icon="calendar" style={{ flex: 1 }} compact />
          <KeyValue label="Visit Time" value={visit.time} icon="clock" style={{ flex: 1 }} compact />
          <View style={{ flex: 1 }}>
            <View style={s.inline}>
              <Icon name="circle-check" size={14} color={colors.brandPrimary} />
              <Text style={s.kvLabel}>Status</Text>
            </View>
            <StatusPill
              label={visit.visitStatus}
              tone={toneForStatus(visit.visitStatus)}
              style={{ marginTop: 4 }}
            />
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={s.noteIcon}>
              <Icon name="notepad-text" size={18} color={colors.brandPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.noteTitle}>{active ? 'Current Visit Notes' : 'Visit Notes'}</Text>
              <Text style={s.noteBody}>{visit.notes}</Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.muted} />
          </View>
          <Divider style={{ marginVertical: spacing.lg }} />
          <PrimaryButton
            label={active ? 'End Current Visit' : 'Visit Closed'}
            icon={active ? 'circle-check' : undefined}
            disabled={!active}
            onPress={endVisit}
          />
        </Card>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[s.sectionTitle, { flex: 1 }]}>Visit History</Text>
          <SelectField
            value={order}
            options={['Latest First', 'Oldest First']}
            onChange={setOrder}
            style={{ width: 150 }}
          />
        </View>

        <View>
          {history.map((h, i) => (
            <View key={h.id} style={s.timelineRow}>
              <View style={s.timelineRail}>
                <View style={s.timelineDot} />
                {i < history.length - 1 ? <View style={s.timelineLine} /> : null}
              </View>

              <Pressable
                style={{ flex: 1 }}
                onPress={() => setExpanded(expanded === h.id ? null : h.id)}
              >
                <View style={s.timelineChip} />
                <Card style={{ marginTop: spacing.sm, flexDirection: 'row', gap: spacing.md }}>
                  <View style={{ width: 74 }}>
                    <Text style={s.histTime}>{h.time}</Text>
                    <Text style={s.histDuration}>{h.duration}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <StatusPill label={h.status} tone={toneForStatus(h.status)} />
                    <Text
                      style={s.histNote}
                      numberOfLines={expanded === h.id ? undefined : 3}
                    >
                      {h.note}
                    </Text>
                  </View>
                </Card>
              </Pressable>
            </View>
          ))}
          {history.length === 0 ? <Text style={s.emptyHistory}>No visit history yet.</Text> : null}
        </View>
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
  kvValueSpaced: { ...type.bodySmall, color: colors.onSurface, marginTop: 2, letterSpacing: 2 },

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

  sectionTitle: { ...type.heading, color: colors.onSurface },

  timelineRow: { flexDirection: 'row', gap: spacing.md },
  timelineRail: { width: 10, alignItems: 'center', paddingTop: 6 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandPrimary },
  timelineLine: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 4 },
  timelineChip: {
    width: 96,
    height: 20,
    borderRadius: radius.sm,
    backgroundColor: colors.brand,
  },
  histTime: { ...type.body, color: colors.onSurface },
  histDuration: { ...type.caption, color: colors.muted, marginTop: 2 },
  histNote: { ...type.bodySmall, color: colors.muted, marginTop: spacing.sm },
  emptyHistory: { ...type.bodySmall, color: colors.muted },
});
