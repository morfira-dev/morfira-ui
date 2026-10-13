import { describe, expect, it } from 'vitest';

import {
  TEXTAREA_RESIZE_MODES,
  TEXTAREA_SIZES,
  TEXTAREA_VALIDATIONS,
  resolveTextareaOptions,
} from '../src/textarea.js';

describe('resolveTextareaOptions', () => {
  it('uses editable vertically resizable defaults', () => {
    expect(resolveTextareaOptions()).toMatchObject({
      size: 'md',
      validation: 'none',
      resize: 'vertical',
      focusable: true,
      editable: true,
    });
  });

  it('distinguishes readonly, disabled, and invalid state', () => {
    expect(resolveTextareaOptions({ readOnly: true })).toMatchObject({
      focusable: true,
      editable: false,
    });
    expect(resolveTextareaOptions({ disabled: true })).toMatchObject({
      focusable: false,
      editable: false,
    });
    expect(resolveTextareaOptions({ validation: 'error' }).ariaInvalid).toBe('true');
    expect(
      resolveTextareaOptions({ validation: 'warning' }).ariaInvalid,
    ).toBeUndefined();
  });

  it('exposes stable public values', () => {
    expect(TEXTAREA_SIZES).toEqual(['sm', 'md', 'lg']);
    expect(TEXTAREA_VALIDATIONS).toEqual(['none', 'error', 'warning', 'success']);
    expect(TEXTAREA_RESIZE_MODES).toEqual(['none', 'vertical', 'both']);
  });
});
