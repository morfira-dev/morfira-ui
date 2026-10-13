import type { SwitchOptions } from '@morfira-dev/core/switch';
import type { HTMLInputAttributes } from 'svelte/elements';
type NativeSwitchProps = Omit<
  HTMLInputAttributes,
  keyof SwitchOptions | 'checked' | 'role' | 'size' | 'type'
>;
export interface SwitchProps extends NativeSwitchProps, Omit<SwitchOptions, 'checked'> {
  checked?: boolean;
  element?: HTMLInputElement | null;
}
