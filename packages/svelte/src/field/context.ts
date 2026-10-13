import type { ResolvedFieldOptions } from '@morfira-dev/core/field';

export const fieldContextKey: unique symbol = Symbol('morfira-field');
export type FieldContext = () => ResolvedFieldOptions;
