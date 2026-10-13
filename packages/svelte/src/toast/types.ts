import type { ToastDismissReason, ToastOptions } from '@morfira-dev/core/toast';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

type NativeToastProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | keyof ToastOptions
  | 'aria-atomic'
  | 'aria-live'
  | 'children'
  | 'hidden'
  | 'role'
  | 'title'
>;

export interface ToastProps extends NativeToastProps, Omit<ToastOptions, 'open'> {
  readonly children: Snippet;
  readonly title?: Snippet;
  readonly closeIcon?: Snippet;
  readonly closeLabel?: string;
  readonly onDismiss?: (reason: ToastDismissReason) => void;
  open?: boolean;
  element?: HTMLDivElement | null;
}
