import { describe, expect, it } from 'vitest';

import { findMenuMatch, resolveMenuOptions } from '../src/menu.js';

describe('Menu core contract', () => {
  it('resolves defaults without mutating entries', () => {
    const source = [{ id: 'open', textValue: 'Open' }] as const;
    expect(resolveMenuOptions({ items: source })).toEqual({
      items: [{ id: 'open', textValue: 'Open', disabled: false }],
      loop: true,
      typeaheadTimeout: 700,
    });
    expect(source[0]).not.toHaveProperty('disabled');
  });

  it('rejects ambiguous IDs, labels, and timeouts', () => {
    expect(() =>
      resolveMenuOptions({
        items: [
          { id: 'same', textValue: 'One' },
          { id: 'same', textValue: 'Two' },
        ],
      }),
    ).toThrow(/unique/u);
    expect(() => resolveMenuOptions({ items: [{ id: 'x', textValue: ' ' }] })).toThrow(
      /textValue/u,
    );
    expect(() => resolveMenuOptions({ items: [], typeaheadTimeout: -1 })).toThrow(
      /non-negative/u,
    );
  });

  it('finds the next enabled prefix match and wraps', () => {
    const { items } = resolveMenuOptions({
      items: [
        { id: 'archive', textValue: 'Archive', disabled: true },
        { id: 'assign', textValue: 'Assign' },
        { id: 'audit', textValue: 'Audit' },
      ],
    });
    expect(findMenuMatch(items, 'a')).toBe(1);
    expect(findMenuMatch(items, 'a', 1)).toBe(2);
    expect(findMenuMatch(items, 'ass', 2)).toBe(1);
  });
});
