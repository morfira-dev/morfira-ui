import type { Component } from 'svelte';

import type { InputProps } from './types.js';

export type { InputProps } from './types.js';

declare const Input: Component<InputProps, Record<string, never>, 'value' | 'element'>;

export default Input;
