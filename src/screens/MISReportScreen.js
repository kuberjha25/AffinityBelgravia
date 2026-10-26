import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import DateField from '../components/DateField';
import { Card, ChipRow, Donut, EmptyState, ErrorState, LoadingState } from '../components/ui';
import { colors, radius, spacing, type, borderWidth, shadow } from '../theme';
import { toApiDate, fromApiDate, todayApiDate } from '../format';
import { usePermissions } from '../store';
import { fetchMis } from '../store/slices/dashboardSlice';

const PERIODS = [
  { id: 'today', label: 'Daily' },
  { id: 'this_week', label: 'Weekly' },
  { id: 'this_month', label: 'Monthly' },
  { id: 'custom', label: 'Custom' },
];

const SEGMENT_COLORS = ['#8a857c', '#4a4741', '#b19777', '#b4534a'];

const segmentsOf = (parts) => {
  const total = parts.reduce((n, p) => n + (p.value || 0), 0);
  return {
    total,
    segments: parts.map((p, i) => ({
      id: p.label,
      label: p.label,
      value: p.value ?? 0,
      pct: total ? Math.round(((p.value || 0) / total) * 100) : 0,
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    })),
  };
};

/**
 * Figma frame: `mis-report-screen` (12:1308).
 * The backend has no report endpoint yet, so the figures are the filtered
 * totals of the visits, leads and registrations lists for the chosen period.
 */
export default function MISReportScreen() {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const { mis, misStatus, misError } = useSelector((state) => state.dashboard);
  const [period, setPeriod] = useState('today');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const startIso = toApiDate(start);
  const endIso = toApiDate(end);
  const customReady = period !== 'custom' || (startIso && endIso && startIso <= endIso);

  const params = useMemo(
    () =>
      period === 'custom'
        ? { date_filter: 'custom', start_date: startIso, end_date: endIso }
        : { date_filter: period },
    [period, startIso, endIso]
  );

  const load = () => {
    if (!customReady) return;
    dispatch(fetchMis(params)).then((a) => {
      if (!a.error) setUpdatedAt(new Date());
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, customReady]);

  if (!can('mis.view')) {
    return (
      <Screen showBack>
        <PageTitle>MIS Report</PageTitle>
        <EmptyState icon="trending-up" title="Not available" body="MIS reports are available to the Affinity Belgravia team." />
      </Screen>
    );
  }

  const n = (v) => (v === null || v === undefined ? '—' : String(v));
  const registrations = mis ? (mis.registrationsPending || 0) + (mis.registrationsCompleted || 0) : null;
  const tiles = mis
    ? [
        { id: 'm1', value: n(mis.visits), label: 'Total Visits' },
        { id: 'm2', value: n(mis.visitsCompleted), label: 'Attended Visits' },
        { id: 'm3', value: n(registrations), label: 'New Registrations' },
        { id: 'm4', value: n(mis.leads), label: 'New Leads' },
        { id: 'm5', value: n(mis.leadsBooked), label: 'Bookings' },
      ]
    : [];

  const visitsSummary = mis
    ? segmentsOf([
        { label: 'Scheduled', value: mis.visitsScheduled },
        { label: 'In Progress', value: mis.visitsInProgress },
        { label: 'Attended', value: mis.visitsCompleted },
        { label: 'Cancelled', value: mis.visitsCancelled },
      ])
    : null;
  const registrationsSummary = mis
    ? segmentsOf([
        { label: 'Pending', value: mis.registrationsPending },
        { label: 'Completed', value: mis.registrationsCompleted },
      ])
    : null;

  const periodLabel = {
    today: fromApiDate(todayApiDate()),
    this_week: 'This week',
    this_month: 'This month',
    custom: customReady ? `${fromApiDate(startIso)} – ${fromApiDate(endIso)}` : 'Select a date range',
  }[period];

  return (
    <Screen showBack onRefresh={load}>
      <PageTitle>MIS Report</PageTitle>

      <ChipRow options={PERIODS} value={period} onChange={setPeriod} contentStyle={{ paddingHorizontal: spacing.xl }} />

      {period === 'custom' ? (
        <View style={s.customRow}>
          <DateField placeholder="From" value={start} onChange={setStart} style={{ flex: 1 }} />
          <DateField placeholder="To" value={end} onChange={setEnd} style={{ flex: 1 }} />
        </View>
      ) : null}
      {period === 'custom' && startIso && endIso && startIso > endIso ? (
        <Text style={[s.note, { color: colors.error, marginTop: spacing.sm }]}>The end date must be on or after the start date.</Text>
      ) : null}

      <View style={s.dateRow}>
        <Icon name="calendar" size={16} color={colors.brandPrimary} />
        <Text style={s.date}>{periodLabel}</Text>
      </View>

      {misStatus === 'loading' && !mis ? <LoadingState /> : null}
      {misStatus === 'failed' ? <ErrorState message={misError} onRetry={load} /> : null}

      {mis && customReady ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
            {tiles.map((t, i) => (
              <View key={t.id} style={[s.tile, i % 2 === 1 && { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={s.tileValue}>{t.value}</Text>
                <Text style={s.tileLabel}>{t.label}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.lg }}>
            <SummaryCard title="Visits Summary" centerLabel="Total Visits" summary={visitsSummary} />
            <SummaryCard title="Registrations Summary" centerLabel="Total" summary={registrationsSummary} />
            {updatedAt ? (
              <Text style={s.note}>
                {`Updated ${updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${misStatus === 'loading' ? ' • refreshing…' : ''}`}
              </Text>
            ) : null}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function SummaryCard({ title, summary, centerLabel }) {
  return (
    <Card>
      <Text style={s.cardTitle}>{title}</Text>
      <View style={s.summaryBody}>
        <Donut segments={summary.segments} centerValue={String(summary.total)} centerLabel={centerLabel} />
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
  customRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.lg },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  date: { ...type.body, color: colors.onSurface },

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

  cardTitle: { ...type.heading, color: colors.onSurface },
  summaryBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.lg },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { ...type.bodySmall, color: colors.onSurfaceTertiary, flex: 1 },
  legendValue: { ...type.bodySmall, color: colors.onSurface },
  legendPct: { ...type.bodySmall, color: colors.muted },

  note: { ...type.caption, color: colors.muted, textAlign: 'center' },
});
