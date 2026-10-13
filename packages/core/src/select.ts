export const SELECT_SIZES: readonly ['sm', 'md', 'lg'] = ['sm', 'md', 'lg'];
export const SELECT_VALIDATIONS: readonly ['none', 'error', 'warning', 'success'] = [
  'none',
  'error',
  'warning',
  'success',
];

export type SelectSize = (typeof SELECT_SIZES)[number];
export type SelectValidation = (typeof SELECT_VALIDATIONS)[number];

export interface SelectOptions {
  readonly size?: SelectSize;
  readonly validation?: SelectValidation;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly multiple?: boolean;
  /** Number of visible native option rows; distinct from the visual control size. */
  readonly visibleRows?: number;
}

export interface ResolvedSelectOptions {
  readonly size: SelectSize;
  readonly validation: SelectValidation;
  readonly disabled: boolean;
  readonly required: boolean;
  readonly multiple: boolean;
  readonly visibleRows: number | undefined;
  readonly interactive: boolean;
  readonly ariaInvalid: 'true' | undefined;
}

/** Resolves native Select state without replacing platform selection or form behavior. */
export function resolveSelectOptions(
  options: SelectOptions = {},
): ResolvedSelectOptions {
  const disabled = options.disabled ?? false;
  const validation = options.validation ?? 'none';

  return {
    size: options.size ?? 'md',
    validation,
    disabled,
    required: options.required ?? false,
    multiple: options.multiple ?? false,
    visibleRows:
      options.visibleRows !== undefined && Number.isFinite(options.visibleRows)
        ? Math.max(1, Math.trunc(options.visibleRows))
        : undefined,
    interactive: !disabled,
    ariaInvalid: validation === 'error' ? 'true' : undefined,
  };
}
