import { describe, expect, it } from 'vitest';
import { resolveTooltipOptions, TOOLTIP_PLACEMENTS } from '../src/tooltip.js';

describe('resolveTooltipOptions', () => {
  it('uses accessible timing and placement defaults', () => {
    expect(resolveTooltipOptions({ contentId: 'tip' })).toEqual({
      contentId: 'tip',
      open: false,
      disabled: false,
      placement: 'block-start',
      openDelay: 500,
      closeDelay: 100,
    });
    expect(TOOLTIP_PLACEMENTS).toEqual([
      'block-start',
      'block-end',
      'inline-start',
      'inline-end',
    ]);
  });
  it('forces disabled tooltips closed and validates IDs and delays', () => {
    expect(
      resolveTooltipOptions({ contentId: 'tip', open: true, disabled: true }).open,
    ).toBe(false);
    expect(() => resolveTooltipOptions({ contentId: 'bad id' })).toThrow(/contentId/);
    expect(() => resolveTooltipOptions({ contentId: 'tip', openDelay: -1 })).toThrow(
      /openDelay/,
    );
  });
});
