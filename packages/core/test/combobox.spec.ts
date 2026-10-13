import { describe, expect, it } from 'vitest';
import {
  createAsyncRequestGate,
  moveComboboxActiveId,
  resolveComboboxState,
} from '../src/combobox.js';

const options = [
  { id: 'alpha-option', value: 'alpha', label: 'Alpha', keywords: ['first'] },
  { id: 'beta-option', value: 'beta', label: 'Beta', disabled: true },
  { id: 'gamma-option', value: 'gamma', label: 'Gamma' },
] as const;

describe('Combobox state', () => {
  it('filters across searchable fields and preserves only valid state', () => {
    const state = resolveComboboxState({
      inputId: 'search',
      listboxId: 'results',
      options,
      query: 'FIRST',
      open: true,
      activeId: 'missing',
      selectedValue: 'beta',
    });
    expect(state.visibleOptions.map(({ value }) => value)).toEqual(['alpha']);
    expect(state.activeId).toBeUndefined();
    expect(state.selectedValue).toBeUndefined();
  });

  it('validates IDs and values', () => {
    expect(() =>
      resolveComboboxState({
        inputId: 'same',
        listboxId: 'same',
        options: [],
      }),
    ).toThrow(/unique/);
    expect(() =>
      resolveComboboxState({
        inputId: 'input',
        listboxId: 'listbox',
        options: [
          { id: 'a', value: 'duplicate', label: 'A' },
          { id: 'b', value: 'duplicate', label: 'B' },
        ],
      }),
    ).toThrow(/values/);
  });

  it('moves without wrapping and skips disabled options', () => {
    const state = resolveComboboxState({
      inputId: 'input',
      listboxId: 'listbox',
      options,
    });
    expect(moveComboboxActiveId(state.visibleOptions, undefined, 1)).toBe(
      'alpha-option',
    );
    expect(moveComboboxActiveId(state.visibleOptions, 'alpha-option', 1)).toBe(
      'gamma-option',
    );
    expect(moveComboboxActiveId(state.visibleOptions, 'gamma-option', 1)).toBe(
      'gamma-option',
    );
    expect(moveComboboxActiveId(state.visibleOptions, undefined, -1)).toBe(
      'gamma-option',
    );
  });

  it('invalidates late async work deterministically', () => {
    const gate = createAsyncRequestGate();
    const first = gate.next();
    const second = gate.next();
    expect(gate.isCurrent(first)).toBe(false);
    expect(gate.isCurrent(second)).toBe(true);
    gate.invalidate();
    expect(gate.isCurrent(second)).toBe(false);
  });
});
