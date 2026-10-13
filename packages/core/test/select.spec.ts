import { describe, expect, it } from 'vitest';

import {
  SELECT_SIZES,
  SELECT_VALIDATIONS,
  resolveSelectOptions,
} from '../src/select.js';

describe('resolveSelectOptions', () => {
  it('uses single-select interactive defaults', () => {
    expect(resolveSelectOptions()).toEqual({
      size: 'md',
      validation: 'none',
      disabled: false,
      required: false,
      multiple: false,
      visibleRows: undefined,
      interactive: true,
      ariaInvalid: undefined,
    });
  });

  it('keeps native visible rows distinct from visual size', () => {
    expect(resolveSelectOptions({ size: 'lg', visibleRows: 3.8 })).toMatchObject({
      size: 'lg',
      visibleRows: 3,
    });
  });

  it('supports native multiple and invalid states', () => {
    expect(
      resolveSelectOptions({ multiple: true, validation: 'error', disabled: true }),
    ).toMatchObject({ multiple: true, interactive: false, ariaInvalid: 'true' });
  });

  it('exposes stable public values', () => {
    expect(SELECT_SIZES).toEqual(['sm', 'md', 'lg']);
    expect(SELECT_VALIDATIONS).toEqual(['none', 'error', 'warning', 'success']);
  });
});
