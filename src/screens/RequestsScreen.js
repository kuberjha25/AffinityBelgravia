import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import {
  Card,
  ChipRow,
  RoundIconButton,
  StatusPill,
  EmptyState,
  ErrorState,
  LoadingState,
  LoadMore,
  toneForStatus,
} from '../components/ui';
import { colors, spacing, type } from '../theme';
import { requestPriorities, requestStatuses } from '../data';
import { fromUtcDateTime, humanize } from '../format';
import { fetchRequests } from '../store/slices/requestsSlice';
import { hasMore } from '../store/helpers';
import { useRefetchWhenStale } from '../hooks';

const statusChips = [{ id: '', label: 'All' }, ...requestStatuses.map((id) => ({ id, label: humanize(id) }))];
const priorityChips = [{ id: '', label: 'Any priority' }, ...requestPriorities.map((id) => ({ id, label: humanize(id) }))];

export const priorityTone = (p) => (p === 'urgent' || p === 'high' ? 'error' : p === 'medium' ? 'warning' : 'neutral');

/** The signed-in partner's requests (GET /partner-requests), filterable by status and priority. */
export default function RequestsScreen({ navigation }) {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.requests.list);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const params = useMemo(() => ({ status: status || undefined, priority: priority || undefined }), [status, priority]);
  const load = (page = 1) => dispatch(fetchRequests({ ...params, page }));

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useRefetchWhenStale(list.stale, () => load(1));

  const onRefresh = async () => {
    setRefreshing(true);
    await load(1);
    setRefreshing(false);
  };

  const firstLoad = list.status === 'loading' && list.page === 0;

  return (
    <Screen showBack refreshing={refreshing} onRefresh={onRefresh}>
      <PageTitle
        subtitle="Payment queries and other requests to the Affinity Belgravia team"
        right={<RoundIconButton name="plus" tone="dark" size={44} iconSize={20} onPress={() => navigation.navigate('NewRequest')} />}
      >
        Requests
      </PageTitle>

      <ChipRow options={statusChips} value={status} onChange={setStatus} contentStyle={{ paddingHorizontal: spacing.xl }} />
      <ChipRow
        options={priorityChips}
        value={priority}
        onChange={setPriority}
        style={{ marginTop: spacing.sm }}
        contentStyle={{ paddingHorizontal: spacing.xl }}
      />

      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md }}>
        {list.status === 'succeeded' || list.items.length ? (
          <Text style={s.count}>{`${list.total} ${list.total === 1 ? 'request' : 'requests'}`}</Text>
        ) : null}

        {list.items.map((r) => (
          <Card key={r.id} onPress={() => navigation.navigate('RequestDetail', { id: r.id })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={s.ref}>{r.reference_id || `#${r.id}`}</Text>
                <Text style={s.type}>{r.type}</Text>
              </View>
              <StatusPill label={humanize(r.status)} tone={toneForStatus(r.status)} />
            </View>

            <View style={s.metaRow}>
              <StatusPill label={humanize(r.priority)} tone={priorityTone(r.priority)} />
              {r.inventory ? (
                <View style={s.inline}>
                  <Icon name="shopping-bag" size={14} color={colors.muted} />
                  <Text style={s.meta}>{r.inventory}</Text>
                </View>
              ) : null}
              {r.is_overdue ? <StatusPill label="Overdue" tone="error" /> : null}
            </View>

            <View style={[s.inline, { marginTop: spacing.md }]}>
              <Icon name="clock" size={14} color={colors.muted} />
              <Text style={s.meta} numberOfLines={1}>
                {`Raised ${fromUtcDateTime(r.created_at)}${r.tat_deadline ? `  ·  Due ${fromUtcDateTime(r.tat_deadline)}` : ''}`}
              </Text>
            </View>
          </Card>
        ))}

        {firstLoad ? <LoadingState /> : null}
        {list.status === 'failed' && !list.items.length ? <ErrorState message={list.error} onRetry={() => load(1)} /> : null}
        {list.status === 'succeeded' && list.items.length === 0 ? (
          <EmptyState icon="notepad-text" title="No requests" body="Tap + to raise a request with our team." />
        ) : null}

        <LoadMore visible={hasMore(list)} loading={list.status === 'loading' && list.page > 0} onPress={() => load(list.page + 1)} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  count: { ...type.caption, color: colors.muted },
  ref: { ...type.caption, color: colors.brandPrimary, letterSpacing: 1 },
  type: { ...type.body, color: colors.onSurface, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
  meta: { ...type.caption, color: colors.muted, flexShrink: 1 },
});
