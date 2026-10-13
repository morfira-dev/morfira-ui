import { describe, expect, it } from 'vitest';
import { resolveTabsOptions } from '../src/tabs.js';

const items = [
  { tabId: 'one-tab', panelId: 'one-panel' },
  { tabId: 'two-tab', panelId: 'two-panel', disabled: true },
  { tabId: 'three-tab', panelId: 'three-panel' },
] as const;

describe('resolveTabsOptions', () => {
  it('selects the first enabled tab and resolves keyboard defaults', () => {
    expect(resolveTabsOptions({ items })).toMatchObject({
      selectedId: 'one-tab',
      orientation: 'horizontal',
      activationMode: 'automatic',
      loop: true,
    });
  });
  it('does not select disabled items and validates references and uniqueness', () => {
    expect(resolveTabsOptions({ items, selectedId: 'two-tab' }).selectedId).toBe(
      'one-tab',
    );
    expect(() => resolveTabsOptions({ items, selectedId: 'missing' })).toThrow(
      /selectedId/,
    );
    expect(() =>
      resolveTabsOptions({ items: [{ tabId: 'same', panelId: 'same' }] }),
    ).toThrow(/unique/);
    expect(
      resolveTabsOptions({
        items: [{ tabId: 'disabled-tab', panelId: 'disabled-panel', disabled: true }],
      }).selectedId,
    ).toBeUndefined();
  });
});
