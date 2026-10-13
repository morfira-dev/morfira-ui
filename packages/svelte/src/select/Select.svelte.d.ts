import type { Component } from 'svelte';
import type { SelectProps } from './types.js';
export type { SelectProps, SelectValue } from './types.js';
declare const Select: Component<
  SelectProps,
  Record<string, never>,
  'element' | 'value'
>;
export default Select;
