import { describe, expect, it } from 'vitest';

import { resolveFieldOptions } from '../src/field.js';

const ids = {
  inputId: 'account-name',
  labelId: 'account-name-label',
  descriptionId: 'account-name-description',
  validationMessageId: 'account-name-validation',
} as const;

describe('resolveFieldOptions', () => {
  it('uses only caller-owned IDs for deterministic associations', () => {
    expect(resolveFieldOptions({ ids })).toMatchObject({
      ids,
      describedBy: 'account-name-description',
      errorMessageId: undefined,
    });
  });

  it('associates active validation messages and errors', () => {
    expect(resolveFieldOptions({ ids, validation: 'warning' })).toMatchObject({
      describedBy: 'account-name-description account-name-validation',
      errorMessageId: undefined,
      ariaInvalid: undefined,
    });
    expect(resolveFieldOptions({ ids, validation: 'error' })).toMatchObject({
      describedBy: 'account-name-description account-name-validation',
      errorMessageId: 'account-name-validation',
      ariaInvalid: 'true',
    });
  });

  it('requires explicit non-empty input and label IDs', () => {
    expect(() =>
      resolveFieldOptions({ ids: { inputId: ' ', labelId: 'label' } }),
    ).toThrow(/inputId/);
    expect(() =>
      resolveFieldOptions({ ids: { inputId: 'input', labelId: '' } }),
    ).toThrow(/labelId/);
    expect(() =>
      resolveFieldOptions({ ids: { inputId: 'field input', labelId: 'label' } }),
    ).toThrow(/whitespace/);
    expect(() =>
      resolveFieldOptions({ ids: { inputId: 'same', labelId: 'same' } }),
    ).toThrow(/unique/);
  });
});
