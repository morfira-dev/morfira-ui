import type { TooltipOptions } from '@morfira-dev/core/tooltip';
import type { TooltipDomOptions } from '@morfira-dev/dom/tooltip';
import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
type NativeTriggerProps = Omit<HTMLButtonAttributes, keyof TooltipOptions | 'children'>;
export interface TooltipProps extends NativeTriggerProps, Omit<TooltipOptions, 'open'> {
  readonly children: Snippet;
  readonly content: Snippet;
  open?: boolean;
  triggerElement?: HTMLButtonElement | null;
  contentElement?: HTMLElement | null;
  readonly onOpenChange?: TooltipDomOptions['onOpenChange'];
}
