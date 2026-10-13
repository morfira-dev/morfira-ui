import type { Component } from 'svelte';

import type { DialogProps } from './types.js';

export type { DialogProps } from './types.js';

declare const Dialog: Component<DialogProps, Record<string, never>, 'element' | 'open'>;

export default Dialog;
