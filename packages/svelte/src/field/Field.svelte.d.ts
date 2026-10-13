import type { Component } from 'svelte';

import type { FieldProps } from './types.js';

export type { FieldProps } from './types.js';

declare const Field: Component<FieldProps, Record<string, never>, ''>;

export default Field;
