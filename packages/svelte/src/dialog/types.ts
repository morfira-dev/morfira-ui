import type { DialogDismissReason, DialogOptions } from '@morfira-dev/core/dialog';
import type { DialogDomOptions } from '@morfira-dev/dom/dialog';
import type { Snippet } from 'svelte';
import type { HTMLDialogAttributes } from 'svelte/elements';

type NativeDialogProps = Omit<
  HTMLDialogAttributes,
  | 'aria-describedby'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-modal'
  | 'children'
  | 'closeOnBackdrop'
  | 'closeOnEscape'
  | 'ids'
  | 'lockScroll'
  | 'on:cancel'
  | 'on:close'
  | 'oncancel'
  | 'onclose'
  | 'open'
  | 'restoreFocus'
  | 'size'
  | 'tabindex'
  | 'title'
>;

export interface DialogProps extends NativeDialogProps, DialogOptions {
  readonly title: string;
  readonly closeLabel: string;
  readonly children: Snippet;
  readonly description?: Snippet;
  readonly footer?: Snippet;
  readonly closeIcon?: Snippet;
  readonly initialFocus?: DialogDomOptions['initialFocus'];
  readonly returnFocus?: DialogDomOptions['returnFocus'];
  readonly onDismiss?: (reason: DialogDismissReason) => void;
  readonly onOpenChange?: (open: boolean, reason: DialogDismissReason) => void;
  element?: HTMLDialogElement | null;
}
