import type { ResolvedFieldOptions } from '@morfira-dev/core/field';
import { createContext, useContext } from 'react';
import type { Context } from 'react';

export const FieldContext: Context<ResolvedFieldOptions | null> =
  createContext<ResolvedFieldOptions | null>(null);

export function useFieldContext(): ResolvedFieldOptions | null {
  return useContext(FieldContext);
}
