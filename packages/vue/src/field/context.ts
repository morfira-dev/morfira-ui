import type { ResolvedFieldOptions } from '@morfira-dev/core/field';
import type { ComputedRef, InjectionKey } from 'vue';

export const fieldContextKey: InjectionKey<ComputedRef<ResolvedFieldOptions>> =
  Symbol('morfira-field');
