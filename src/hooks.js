import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLookup } from './store/slices/lookupsSlice';

/** An admin-managed master list (`categories`, `sources`, `timeSlots`, `cpDocuments`), loaded once. */
export function useLookup(name) {
  const dispatch = useDispatch();
  const entry = useSelector((state) => state.lookups[name]);
  useEffect(() => {
    dispatch(fetchLookup(name));
  }, [dispatch, name]);
  return { ...entry, reload: () => dispatch(fetchLookup(name)) };
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
