import type { DrawerDismissReason, DrawerOptions } from '@morfira-dev/core/drawer';
import type { DrawerDomOptions } from '@morfira-dev/dom/drawer';
import type { Snippet } from 'svelte';
import type { HTMLDialogAttributes } from 'svelte/elements';

type NativeDrawerProps = Omit<
  HTMLDialogAttributes,
  | keyof DrawerOptions
  | 'aria-describedby'
  | 'aria-labelledby'
  | 'aria-modal'
  | 'children'
  | 'on:cancel'
  | 'on:close'
  | 'oncancel'
  | 'onclose'
  | 'open'
  | 'role'
  | 'tabindex'
  | 'title'
>;

export interface DrawerProps extends NativeDrawerProps, Omit<DrawerOptions, 'open'> {
  readonly title: string;
  readonly closeLabel: string;
  readonly children: Snippet;
  readonly description?: Snippet;
  readonly footer?: Snippet;
  readonly closeIcon?: Snippet;
  readonly initialFocus?: DrawerDomOptions['initialFocus'];
  readonly returnFocus?: DrawerDomOptions['returnFocus'];
  readonly onDismiss?: (reason: DrawerDismissReason) => void;
  open?: boolean;
  element?: HTMLDialogElement | null;
}
