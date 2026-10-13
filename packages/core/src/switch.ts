export const SWITCH_SIZES: readonly ['sm', 'md', 'lg'] = ['sm', 'md', 'lg'];

export type SwitchSize = (typeof SWITCH_SIZES)[number];

export interface SwitchOptions {
  readonly size?: SwitchSize;
  readonly checked?: boolean;
  readonly disabled?: boolean;
  readonly required?: boolean;
}

export interface ResolvedSwitchOptions {
  readonly size: SwitchSize;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly required: boolean;
  readonly interactive: boolean;
  readonly ariaChecked: 'true' | 'false';
}

/** Resolves binary Switch state for a native checkbox exposed with role=switch. */
export function resolveSwitchOptions(
  options: SwitchOptions = {},
): ResolvedSwitchOptions {
  const checked = options.checked ?? false;
  const disabled = options.disabled ?? false;

  return {
    size: options.size ?? 'md',
    checked,
    disabled,
    required: options.required ?? false,
    interactive: !disabled,
    ariaChecked: checked ? 'true' : 'false',
  };
}
