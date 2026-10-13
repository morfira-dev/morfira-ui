import type { ButtonOptions } from '@morfira-dev/core/button';
import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';

type NativeButtonProps = Omit<
  HTMLButtonAttributes,
  keyof ButtonOptions | 'aria-busy' | 'children' | 'on:click'
>;

export interface ButtonProps extends NativeButtonProps, ButtonOptions {
  readonly children?: Snippet;
}
