import type { Component } from 'svelte';
import type { TooltipProps } from './types.js';
export type { TooltipProps } from './types.js';
declare const Tooltip: Component<
  TooltipProps,
  Record<string, never>,
  'open' | 'triggerElement' | 'contentElement'
>;
export default Tooltip;
