import { describe, expect, it } from 'vitest';
import { resolveAccordionOptions } from '../src/accordion.js';

const items = [
  { triggerId: 'one-trigger', panelId: 'one-panel' },
  { triggerId: 'two-trigger', panelId: 'two-panel' },
] as const;

describe('resolveAccordionOptions', () => {
  it('defaults to a single collapsible accordion', () => {
    expect(
      resolveAccordionOptions({ items, expandedIds: ['one-trigger', 'two-trigger'] }),
    ).toMatchObject({
      expandedIds: ['one-trigger'],
      multiple: false,
      collapsible: true,
    });
  });
  it('deduplicates multiple values and validates relationships', () => {
    expect(
      resolveAccordionOptions({
        items,
        multiple: true,
        expandedIds: ['one-trigger', 'one-trigger', 'two-trigger'],
      }).expandedIds,
    ).toEqual(['one-trigger', 'two-trigger']);
    expect(() => resolveAccordionOptions({ items, expandedIds: ['missing'] })).toThrow(
      /expandedIds/,
    );
    expect(() =>
      resolveAccordionOptions({ items: [{ triggerId: 'same', panelId: 'same' }] }),
    ).toThrow(/unique/);
    expect(resolveAccordionOptions({ items, collapsible: false }).expandedIds).toEqual([
      'one-trigger',
    ]);
  });
});
