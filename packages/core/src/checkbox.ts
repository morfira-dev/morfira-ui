export const CHECKBOX_SIZES: readonly ['sm', 'md', 'lg'] = ['sm', 'md', 'lg'];

export type CheckboxSize = (typeof CHECKBOX_SIZES)[number];

export interface CheckboxOptions {
  readonly size?: CheckboxSize;
  readonly checked?: boolean;
  readonly indeterminate?: boolean;
  readonly disabled?: boolean;
  readonly required?: boolean;
}

export interface ResolvedCheckboxOptions {
  readonly size: CheckboxSize;
  readonly checked: boolean;
  readonly indeterminate: boolean;
  readonly disabled: boolean;
  readonly required: boolean;
  readonly interactive: boolean;
  readonly ariaChecked: 'mixed' | undefined;
}

/** Resolves Checkbox state while leaving activation and form behavior to the native input. */
export function resolveCheckboxOptions(
  options: CheckboxOptions = {},
): ResolvedCheckboxOptions {
  const indeterminate = options.indeterminate ?? false;
  const disabled = options.disabled ?? false;

  return {
    size: options.size ?? 'md',
    checked: options.checked ?? false,
    indeterminate,
    disabled,
    required: options.required ?? false,
    interactive: !disabled,
    ariaChecked: indeterminate ? 'mixed' : undefined,
  };
}
