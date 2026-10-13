import type { MenuItem } from '@morfira-dev/core/menu';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface SvelteMenuItem extends MenuItem {
  readonly label: Snippet;
}

export interface MenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  readonly items: readonly SvelteMenuItem[];
  readonly ariaLabel: string;
  readonly loop?: boolean;
  readonly typeaheadTimeout?: number;
  readonly onSelect?: (id: string) => void;
  readonly onDismiss?: (reason: 'escape' | 'tab' | 'select') => void;
}
