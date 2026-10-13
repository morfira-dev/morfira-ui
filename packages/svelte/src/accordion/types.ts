import type { AccordionItem } from '@morfira-dev/core/accordion';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface SvelteAccordionItem extends AccordionItem {
  readonly title: Snippet;
  readonly content: Snippet;
}
export interface AccordionProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  readonly items: readonly SvelteAccordionItem[];
  expandedIds?: readonly string[];
  readonly defaultExpandedIds?: readonly string[];
  readonly multiple?: boolean;
  readonly collapsible?: boolean;
  readonly onExpandedChange?: (expandedIds: readonly string[]) => void;
}
