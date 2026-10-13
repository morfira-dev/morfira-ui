import type { Component } from 'svelte';
import type { AccordionProps } from './types.js';
export type { AccordionProps, SvelteAccordionItem } from './types.js';
declare const Accordion: Component<
  AccordionProps,
  Record<string, never>,
  'expandedIds'
>;
export default Accordion;
