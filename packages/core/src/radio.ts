export const RADIO_SIZES: readonly ['sm', 'md', 'lg'] = ['sm', 'md', 'lg'];

export type RadioSize = (typeof RADIO_SIZES)[number];

export interface RadioOptions {
  readonly size?: RadioSize;
  readonly checked?: boolean;
  readonly disabled?: boolean;
  readonly required?: boolean;
}

export interface ResolvedRadioOptions {
  readonly size: RadioSize;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly required: boolean;
  readonly interactive: boolean;
}

/** Resolves one radio's state; grouping and arrow-key behavior stay native by shared name. */
export function resolveRadioOptions(options: RadioOptions = {}): ResolvedRadioOptions {
  const disabled = options.disabled ?? false;

  return {
    size: options.size ?? 'md',
    checked: options.checked ?? false,
    disabled,
    required: options.required ?? false,
    interactive: !disabled,
  };
}
