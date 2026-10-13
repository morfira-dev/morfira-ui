import type { DropdownPlacement } from '@morfira-dev/core/dropdown';
import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { SvelteMenuItem } from '../menu/types.js';

export type DropdownOpenReason =
  | 'trigger'
  | 'arrow-first'
  | 'arrow-last'
  | 'escape'
  | 'outside-pointer'
  | 'tab'
  | 'select';

export interface DropdownProps extends Omit<
  HTMLButtonAttributes,
  'children' | 'disabled'
> {
  readonly contentId: string;
  readonly ariaLabel: string;
  readonly items: readonly SvelteMenuItem[];
  readonly children: Snippet;
  open?: boolean;
  readonly disabled?: boolean;
  readonly placement?: DropdownPlacement;
  readonly closeOnEscape?: boolean;
  readonly closeOnOutsidePointer?: boolean;
  readonly restoreFocus?: boolean;
  readonly onOpenChange?: (open: boolean, reason: DropdownOpenReason) => void;
  readonly onSelect?: (id: string) => void;
}
