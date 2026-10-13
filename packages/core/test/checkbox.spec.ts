import { describe, expect, it } from 'vitest';

import { CHECKBOX_SIZES, resolveCheckboxOptions } from '../src/checkbox.js';

describe('resolveCheckboxOptions', () => {
  it('uses native-friendly defaults', () => {
    expect(resolveCheckboxOptions()).toEqual({
      size: 'md',
      checked: false,
      indeterminate: false,
      disabled: false,
      required: false,
      interactive: true,
      ariaChecked: undefined,
    });
  });

  it('exposes mixed state and disabled interactivity', () => {
    expect(
      resolveCheckboxOptions({ checked: true, indeterminate: true, disabled: true }),
    ).toMatchObject({
      checked: true,
      indeterminate: true,
      interactive: false,
      ariaChecked: 'mixed',
    });
  });

  it('exposes stable sizes', () => {
    expect(CHECKBOX_SIZES).toEqual(['sm', 'md', 'lg']);
  });
});
