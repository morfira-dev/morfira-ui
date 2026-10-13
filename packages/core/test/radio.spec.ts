import { describe, expect, it } from 'vitest';

import { RADIO_SIZES, resolveRadioOptions } from '../src/radio.js';

describe('resolveRadioOptions', () => {
  it('uses unchecked interactive defaults', () => {
    expect(resolveRadioOptions()).toEqual({
      size: 'md',
      checked: false,
      disabled: false,
      required: false,
      interactive: true,
    });
  });

  it('keeps checked and disabled state independent', () => {
    expect(
      resolveRadioOptions({ checked: true, disabled: true, required: true }),
    ).toMatchObject({
      checked: true,
      disabled: true,
      required: true,
      interactive: false,
    });
  });

  it('exposes stable sizes', () => {
    expect(RADIO_SIZES).toEqual(['sm', 'md', 'lg']);
  });
});
