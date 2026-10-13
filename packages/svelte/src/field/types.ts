import type { FieldOptions } from '@morfira-dev/core/field';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

type NativeFieldProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  keyof FieldOptions | 'children' | 'prefix'
>;

export interface FieldProps extends NativeFieldProps, FieldOptions {
  readonly label: string;
  readonly description?: string;
  readonly validationMessage?: string;
  readonly prefix?: Snippet;
  readonly suffix?: Snippet;
  readonly children: Snippet;
}
