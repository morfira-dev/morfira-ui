import type { CheckboxOptions } from '@morfira-dev/core/checkbox';
import type { HTMLInputAttributes } from 'svelte/elements';

type NativeCheckboxProps = Omit<
  HTMLInputAttributes,
  keyof CheckboxOptions | 'checked' | 'size' | 'type'
>;
export interface CheckboxProps
  extends NativeCheckboxProps, Omit<CheckboxOptions, 'checked'> {
  checked?: boolean;
  element?: HTMLInputElement | null;
}
