import { describe, expect, it } from 'vitest';
import { POPOVER_PLACEMENTS, resolvePopoverOptions } from '../src/popover.js';

describe('resolvePopoverOptions', () => {
  it('uses conservative dismiss and focus defaults', () => {
    expect(resolvePopoverOptions({ contentId: 'details' })).toEqual({
      contentId: 'details',
      open: false,
      disabled: false,
      placement: 'block-end',
      closeOnEscape: true,
      closeOnOutsidePointer: true,
      restoreFocus: true,
    });
    expect(POPOVER_PLACEMENTS).toHaveLength(4);
  });
  it('preserves policies and validates the relationship ID', () => {
    expect(
      resolvePopoverOptions({ contentId: 'details', open: true, closeOnEscape: false })
        .open,
    ).toBe(true);
    expect(
      resolvePopoverOptions({ contentId: 'details', open: true, disabled: true }).open,
    ).toBe(false);
    expect(() => resolvePopoverOptions({ contentId: '' })).toThrow(/contentId/);
  });
});
