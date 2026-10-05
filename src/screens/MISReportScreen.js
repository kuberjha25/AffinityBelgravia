import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import { Card, ChipRow, Divider, Donut } from '../components/ui';
import { colors, radius, spacing, type, borderWidth, shadow } from '../theme';
import { misPeriods, misReport } from '../data';

/** Figma frame: `mis-report-screen` (12:1308). */
export default function MISReportScreen() {
  const [period, setPeriod] = useState('Daily');

  return (
    <Screen showBack>
      <PageTitle>MIS Report</PageTitle>

      <ChipRow
        options={misPeriods}
        value={period}
        onChange={setPeriod}
        contentStyle={{ paddingHorizontal: spacing.xl }}
      />

      <View style={s.dateRow}>
        <View style={s.inline}>
          <Icon name="calendar" size={16} color={colors.brandPrimary} />
          <Text style={s.date}>{misReport.date}</Text>
        </View>
        <Pressable
          style={s.downloadBtn}
          onPress={() => Alert.alert('Download Report', `${period} MIS report queued for download.`)}
        >
          <Icon name="download" size={14} color={colors.brandPrimary} />
          <Text style={s.downloadLabel}>Download Report</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md }}
      >
        {misReport.tiles.map((t, i) => (
          <View key={t.id} style={[s.tile, i % 2 === 1 && { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={s.tileValue}>{t.value}</Text>
            <Text style={s.tileLabel}>{t.label}</Text>
            <Text style={s.tileDelta}>{t.delta}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.lg }}>
        <SummaryCard title="Visits Summary" summary={misReport.visitsSummary} />
        <SummaryCard title="Registrations Summary" summary={misReport.registrationsSummary} />

        <Card>
          <Text style={s.cardTitle}>Top Projects by Visits</Text>
          <View style={s.tableHead}>
            <Text style={[s.tableHeadCell, { flex: 1 }]}>Project Name</Text>
            <Text style={s.tableHeadCell}>Total Visits</Text>
          </View>
          {misReport.topProjects.map((p, i) => (
            <View key={p.id}>
              <Divider />
              <View style={s.tableRow}>
                <Text style={[s.projectName, { flex: 1 }]} numberOfLines={1}>{p.name}</Text>
                <Text style={[s.projectVisits, i > 0 && { color: colors.brandPrimary }]}>{p.visits}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Text style={s.note}>{misReport.updatedNote}</Text>
      </View>
    </Screen>
  );
}

function SummaryCard({ title, summary }) {
  return (
    <Card>
      <Text style={s.cardTitle}>{title}</Text>
      <View style={s.summaryBody}>
        <Donut
          segments={summary.segments}
          centerValue={String(summary.total)}
          centerLabel={summary.label}
        />
        <View style={{ flex: 1, gap: spacing.md }}>
          {summary.segments.map((seg) => (
            <View key={seg.id} style={s.legendRow}>
              <View style={[s.legendDot, { backgroundColor: seg.color }]} />
              <Text style={s.legendLabel}>{seg.label}</Text>
              <Text style={s.legendValue}>{seg.value}</Text>
              <Text style={s.legendPct}>{`(${seg.pct}%)`}</Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  date: { ...type.body, color: colors.onSurface },
  downloadBtn: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: borderWidth.default,
    borderColor: colors.brandPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadLabel: { ...type.bodySmall, color: colors.brandPrimary },

  tile: {
    width: 150,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  tileValue: { ...type.display, color: colors.onSurface },
  tileLabel: { ...type.bodySmall, color: colors.onSurfaceTertiary, marginTop: spacing.xs },
  tileDelta: { ...type.caption, color: colors.brandPrimary, marginTop: spacing.sm },

  cardTitle: { ...type.heading, color: colors.onSurface },
  summaryBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.lg },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { ...type.bodySmall, color: colors.onSurfaceTertiary, flex: 1 },
  legendValue: { ...type.bodySmall, color: colors.onSurface },
  legendPct: { ...type.bodySmall, color: colors.muted },

  tableHead: { flexDirection: 'row', marginTop: spacing.lg, marginBottom: spacing.sm },
  tableHeadCell: { ...type.caption, color: colors.muted },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  projectName: { ...type.bodySmall, color: colors.onSurface, letterSpacing: 2 },
  projectVisits: { ...type.body, color: colors.onSurface },

  note: { ...type.caption, color: colors.muted, textAlign: 'center' },
});
