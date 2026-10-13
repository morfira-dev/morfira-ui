export const INPUT_SIZES: readonly ['sm', 'md', 'lg'] = ['sm', 'md', 'lg'];

export const INPUT_VALIDATIONS: readonly ['none', 'error', 'warning', 'success'] = [
  'none',
  'error',
  'warning',
  'success',
];

export type InputSize = (typeof INPUT_SIZES)[number];
export type InputValidation = (typeof INPUT_VALIDATIONS)[number];

export interface InputOptions {
  readonly size?: InputSize;
  readonly validation?: InputValidation;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
}

export interface ResolvedInputOptions {
  readonly size: InputSize;
  readonly validation: InputValidation;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly required: boolean;
  readonly focusable: boolean;
  readonly editable: boolean;
  readonly ariaInvalid: 'true' | undefined;
}

/**
 * Resolves the framework-independent Input contract without replacing native input
 * behavior. Read-only inputs remain focusable and successful form controls; disabled
 * inputs do not.
 */
export function resolveInputOptions(options: InputOptions = {}): ResolvedInputOptions {
  const disabled = options.disabled ?? false;
  const readOnly = options.readOnly ?? false;
  const validation = options.validation ?? 'none';

  return {
    size: options.size ?? 'md',
    validation,
    disabled,
    readOnly,
    required: options.required ?? false,
    focusable: !disabled,
    editable: !disabled && !readOnly,
    ariaInvalid: validation === 'error' ? 'true' : undefined,
  };
}
