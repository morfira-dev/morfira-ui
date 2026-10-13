import type { PopoverOptions } from '@morfira-dev/core/popover';
import type { PopoverDomOptions } from '@morfira-dev/dom/popover';
import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
type NativeTriggerProps = Omit<HTMLButtonAttributes, keyof PopoverOptions | 'children'>;
export interface PopoverProps extends NativeTriggerProps, Omit<PopoverOptions, 'open'> {
  readonly ariaLabel: string;
  readonly children: Snippet;
  readonly content: Snippet;
  open?: boolean;
  triggerElement?: HTMLButtonElement | null;
  contentElement?: HTMLElement | null;
  readonly onOpenChange?: PopoverDomOptions['onOpenChange'];
}
