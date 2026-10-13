import type {
  TabItem,
  TabsActivationMode,
  TabsOrientation,
} from '@morfira-dev/core/tabs';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface SvelteTabItem extends TabItem {
  readonly label: Snippet;
  readonly content: Snippet;
}
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  readonly items: readonly SvelteTabItem[];
  selectedId?: string;
  readonly defaultSelectedId?: string;
  readonly orientation?: TabsOrientation;
  readonly activationMode?: TabsActivationMode;
  readonly loop?: boolean;
  readonly onSelectedChange?: (tabId: string) => void;
}
