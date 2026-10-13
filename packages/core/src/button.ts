export const BUTTON_VARIANTS: readonly ['primary', 'secondary', 'ghost', 'danger'] = [
  'primary',
  'secondary',
  'ghost',
  'danger',
];

export const BUTTON_SIZES: readonly ['sm', 'md', 'lg'] = ['sm', 'md', 'lg'];

export const BUTTON_TYPES: readonly ['button', 'submit', 'reset'] = [
  'button',
  'submit',
  'reset',
];

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonSize = (typeof BUTTON_SIZES)[number];
export type ButtonType = (typeof BUTTON_TYPES)[number];

export interface ButtonOptions {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly type?: ButtonType;
  readonly disabled?: boolean;
  readonly loading?: boolean;
}

export interface ResolvedButtonOptions {
  readonly variant: ButtonVariant;
  readonly size: ButtonSize;
  readonly type: ButtonType;
  readonly disabled: boolean;
  readonly loading: boolean;
  readonly nativeDisabled: boolean;
  readonly interactive: boolean;
}

/**
 * Resolves the framework-independent Button contract.
 *
 * Loading participates in effective disabled state so every renderer can prevent
 * duplicate activation without inventing adapter-specific behavior.
 */
export function resolveButtonOptions(
  options: ButtonOptions = {},
): ResolvedButtonOptions {
  const disabled = options.disabled ?? false;
  const loading = options.loading ?? false;
  const nativeDisabled = disabled || loading;

  return {
    variant: options.variant ?? 'primary',
    size: options.size ?? 'md',
    type: options.type ?? 'button',
    disabled,
    loading,
    nativeDisabled,
    interactive: !nativeDisabled,
  };
}
