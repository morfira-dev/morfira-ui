import { describe, expect, it } from 'vitest';

import { resolveDropdownOptions } from '../src/dropdown.js';

describe('Dropdown core contract', () => {
  it('resolves disclosure defaults', () => {
    expect(resolveDropdownOptions({ contentId: 'release-actions' })).toEqual({
      contentId: 'release-actions',
      open: false,
      disabled: false,
      placement: 'block-end',
      closeOnEscape: true,
      closeOnOutsidePointer: true,
      restoreFocus: true,
    });
  });

  it('rejects invalid IDs and placements', () => {
    expect(() => resolveDropdownOptions({ contentId: 'bad id' })).toThrow(/contentId/u);
    expect(() =>
      resolveDropdownOptions({ contentId: 'menu', placement: 'center' as never }),
    ).toThrow(/placement/u);
  });
});
