import type { RadioOptions } from '@morfira-dev/core/radio';
import type { HTMLInputAttributes } from 'svelte/elements';
export type RadioValue = string | number | boolean;
type NativeRadioProps = Omit<
  HTMLInputAttributes,
  keyof RadioOptions | 'checked' | 'size' | 'type' | 'value'
>;
export interface RadioProps extends NativeRadioProps, Omit<RadioOptions, 'checked'> {
  readonly value: RadioValue;
  group?: RadioValue;
  element?: HTMLInputElement | null;
}
