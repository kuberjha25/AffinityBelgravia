import React from 'react';
import { View } from 'react-native';
import { SelectField } from './ui';
import { spacing } from '../theme';
import { citiesByState, states as bundledStates } from '../data';
import { useKeyedLookup, useLookup } from '../hooks';

const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

/**
 * States from GET /states. Falls back to the bundled list only when the API
 * can't be reached, so the forms still work offline.
 * → `{ names, loading, findState(name) }`
 */
export function useStates() {
  const states = useLookup('states');
  const apiNames = (states.items || []).map((st) => st.name);
  const offline = states.status === 'failed' && !apiNames.length;
  return {
    names: offline ? bundledStates : apiNames,
    loading: states.status === 'loading' || states.status === 'idle',
    /** The API row for a state name (case-insensitive), or null. */
    findState: (name) => (states.items || []).find((st) => same(st.name, name)) || null,
    /** The state name as the list spells it, for a name from elsewhere (PIN code lookup). */
    canonical: (name) => (offline ? bundledStates : apiNames).find((n) => same(n, name)) || name,
  };
}

/**
 * State then City. Cities come from GET /cities?state_id= once a state is
 * chosen; changing the state clears the city. Forms submit the **names**.
 * `row` lays the pair out side by side, as on the New Lead / Schedule Visit forms.
 */
export default function StateCityFields({ state, city, onChange, row, cityIcon = 'building', stateIcon = 'map', placeholders = {} }) {
  const { names, loading, findState } = useStates();
  const stateRow = state ? findState(state) : null;
  const cities = useKeyedLookup('cities', stateRow ? String(stateRow.id) : '');

  const apiCities = (cities.items || []).map((c) => c.name);
  // No API id for the state (offline list) or the city request failed → bundled cities.
  const useBundled = state && (!stateRow || (cities.status === 'failed' && !apiCities.length));
  const cityNames = useBundled ? citiesByState[state] || [] : apiCities;
  const citiesLoading = Boolean(stateRow) && (cities.status === 'loading' || cities.status === 'idle');

  const statePicker = (
    <SelectField
      icon={stateIcon}
      placeholder={loading ? 'Loading states…' : placeholders.state || 'State'}
      sheetTitle="Select State"
      value={state}
      options={names}
      searchable
      onChange={(v) => onChange({ state: v, city: v === state ? city : '' })}
      style={row ? { flex: 1 } : undefined}
    />
  );
  const cityPicker = (
    <SelectField
      icon={cityIcon}
      placeholder={
        citiesLoading ? 'Loading cities…' : state || row ? placeholders.city || 'City' : 'Select state first'
      }
      sheetTitle={state ? `Cities in ${state}` : 'City'}
      value={city}
      options={cityNames}
      searchable
      disabled={!state}
      onChange={(v) => onChange({ state, city: v })}
      style={row ? { flex: 1 } : undefined}
    />
  );
  if (row) {
    return (
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        {statePicker}
        {cityPicker}
      </View>
    );
  }
  return (
    <>
      {statePicker}
      {cityPicker}
    </>
  );
}
