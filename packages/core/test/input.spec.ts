import { describe, expect, it } from 'vitest';

import { INPUT_SIZES, INPUT_VALIDATIONS, resolveInputOptions } from '../src/input.js';

describe('resolveInputOptions', () => {
  it('uses neutral native-input defaults', () => {
    expect(resolveInputOptions()).toEqual({
      size: 'md',
      validation: 'none',
      disabled: false,
      readOnly: false,
      required: false,
      focusable: true,
      editable: true,
      ariaInvalid: undefined,
    });
  });

  it('keeps disabled and read-only semantics distinct', () => {
    expect(resolveInputOptions({ disabled: true })).toMatchObject({
      disabled: true,
      readOnly: false,
      focusable: false,
      editable: false,
    });
    expect(resolveInputOptions({ readOnly: true })).toMatchObject({
      disabled: false,
      readOnly: true,
      focusable: true,
      editable: false,
    });
  });

  it('marks only errors as aria-invalid', () => {
    expect(resolveInputOptions({ validation: 'error' }).ariaInvalid).toBe('true');
    expect(resolveInputOptions({ validation: 'warning' }).ariaInvalid).toBe(undefined);
    expect(resolveInputOptions({ validation: 'success' }).ariaInvalid).toBe(undefined);
  });

  it('exposes stable public sizes and validation states', () => {
    expect(INPUT_SIZES).toEqual(['sm', 'md', 'lg']);
    expect(INPUT_VALIDATIONS).toEqual(['none', 'error', 'warning', 'success']);
  });
});
