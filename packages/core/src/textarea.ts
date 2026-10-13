export const TEXTAREA_SIZES: readonly ['sm', 'md', 'lg'] = ['sm', 'md', 'lg'];
export const TEXTAREA_VALIDATIONS: readonly ['none', 'error', 'warning', 'success'] = [
  'none',
  'error',
  'warning',
  'success',
];
export const TEXTAREA_RESIZE_MODES: readonly ['none', 'vertical', 'both'] = [
  'none',
  'vertical',
  'both',
];

export type TextareaSize = (typeof TEXTAREA_SIZES)[number];
export type TextareaValidation = (typeof TEXTAREA_VALIDATIONS)[number];
export type TextareaResize = (typeof TEXTAREA_RESIZE_MODES)[number];

export interface TextareaOptions {
  readonly size?: TextareaSize;
  readonly validation?: TextareaValidation;
  readonly resize?: TextareaResize;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
}

export interface ResolvedTextareaOptions {
  readonly size: TextareaSize;
  readonly validation: TextareaValidation;
  readonly resize: TextareaResize;
  readonly disabled: boolean;
  readonly readOnly: boolean;
  readonly required: boolean;
  readonly focusable: boolean;
  readonly editable: boolean;
  readonly ariaInvalid: 'true' | undefined;
}

export function resolveTextareaOptions(
  options: TextareaOptions = {},
): ResolvedTextareaOptions {
  const disabled = options.disabled ?? false;
  const readOnly = options.readOnly ?? false;
  const validation = options.validation ?? 'none';

  return {
    size: options.size ?? 'md',
    validation,
    resize: options.resize ?? 'vertical',
    disabled,
    readOnly,
    required: options.required ?? false,
    focusable: !disabled,
    editable: !disabled && !readOnly,
    ariaInvalid: validation === 'error' ? 'true' : undefined,
  };
}
