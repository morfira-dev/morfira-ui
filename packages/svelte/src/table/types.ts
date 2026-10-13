import type { TableOptions } from '@morfira-dev/core/table';
import type { Snippet } from 'svelte';
import type { HTMLTableAttributes } from 'svelte/elements';

type NativeTableProps = Omit<HTMLTableAttributes, keyof TableOptions | 'children'>;

export interface TableProps extends NativeTableProps, TableOptions {
  children?: Snippet;
  element?: HTMLTableElement | null;
}
