import { describe, expect, it } from 'vitest';

import {
  BUTTON_SIZES,
  BUTTON_TYPES,
  BUTTON_VARIANTS,
  resolveButtonOptions,
} from '../src/button.js';

describe('resolveButtonOptions', () => {
  it('uses safe native-button defaults', () => {
    expect(resolveButtonOptions()).toEqual({
      variant: 'primary',
      size: 'md',
      type: 'button',
      disabled: false,
      loading: false,
      nativeDisabled: false,
      interactive: true,
    });
  });

  it('keeps loading and disabled intent distinct while blocking both', () => {
    expect(resolveButtonOptions({ loading: true })).toMatchObject({
      disabled: false,
      loading: true,
      nativeDisabled: true,
      interactive: false,
    });

    expect(resolveButtonOptions({ disabled: true })).toMatchObject({
      disabled: true,
      loading: false,
      nativeDisabled: true,
      interactive: false,
    });
  });

  it('exposes stable public variants, sizes, and native types', () => {
    expect(BUTTON_VARIANTS).toEqual(['primary', 'secondary', 'ghost', 'danger']);
    expect(BUTTON_SIZES).toEqual(['sm', 'md', 'lg']);
    expect(BUTTON_TYPES).toEqual(['button', 'submit', 'reset']);
  });
});
