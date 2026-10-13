import type { InputOptions } from '@morfira-dev/core/input';
import type { HTMLInputAttributes } from 'svelte/elements';

type NativeInputProps = Omit<
  HTMLInputAttributes,
  | keyof InputOptions
  | 'aria-invalid'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'aria-errormessage'
  | 'size'
  | 'value'
>;

export interface InputProps extends NativeInputProps, InputOptions {
  value?: string | number;
  element?: HTMLInputElement | null;
}
