import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchKeyedLookup, fetchLookup } from './store/slices/lookupsSlice';
import { leadStatusesFallback, systemLeadStatuses } from './data';
import { humanize } from './format';

/**
 * An admin-managed master list (`categories`, `sources`, `leadStatuses`,
 * `timeSlots`, `businessTypes`, `states`, `requestTypes`), loaded once per session.
 */
export function useLookup(name) {
  const dispatch = useDispatch();
  const entry = useSelector((state) => state.lookups[name]);
  useEffect(() => {
    dispatch(fetchLookup(name));
  }, [dispatch, name]);
  return { ...entry, reload: () => dispatch(fetchLookup(name)) };
}

const IDLE = { items: [], status: 'idle', error: null };

/**
 * A master list that depends on a key: `cities` of a state id, `cpDocuments`
 * of a business type slug. Nothing is loaded while `key` is empty.
 */
export function useKeyedLookup(name, key) {
  const dispatch = useDispatch();
  const entry = useSelector((state) => (key ? state.lookups[name][key] : null)) || IDLE;
  useEffect(() => {
    if (key) dispatch(fetchKeyedLookup({ name, key }));
  }, [dispatch, name, key]);
  return { ...entry, reload: () => key && dispatch(fetchKeyedLookup({ name, key })) };
}

/** `value`, updated only after it stops changing for `delay` ms (search boxes). */
export function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Runs `refetch` when the screen regains focus and its data was changed elsewhere. */
export function useRefetchWhenStale(stale, refetch) {
  const ref = useRef(refetch);
  ref.current = refetch;
  useFocusEffect(
    useCallback(() => {
      if (stale) ref.current();
    }, [stale])
  );
}

/**
 * Lead statuses. `settable` = what PUT /leads/{id} accepts (GET /leads/statuses,
 * bundled copy if that fails); `all` adds the system statuses for list filters.
 * Both are `[{ id, label }]`.
 */
export function useLeadStatuses() {
  const statuses = useLookup('leadStatuses');
  const source = statuses.items?.length ? statuses.items : statuses.status === 'failed' ? leadStatusesFallback : [];
  const settable = source.map((st) => ({ id: st.id, label: st.name || humanize(st.id) }));
  const all = [
    ...systemLeadStatuses.map((id) => ({ id, label: humanize(id) })),
    ...settable.filter((st) => !systemLeadStatuses.includes(st.id)),
  ];
  return { settable, all, loading: statuses.status === 'loading' };
}
