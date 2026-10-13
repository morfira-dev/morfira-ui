import type { SelectOptions } from '@morfira-dev/core/select';
import type { Snippet } from 'svelte';
import type { HTMLSelectAttributes } from 'svelte/elements';
export type SelectValue = string | number | string[];
type NativeSelectProps = Omit<
  HTMLSelectAttributes,
  keyof SelectOptions | 'aria-invalid' | 'children' | 'size' | 'value'
>;
export interface SelectProps extends NativeSelectProps, SelectOptions {
  children?: Snippet;
  value?: SelectValue;
  element?: HTMLSelectElement | null;
}
