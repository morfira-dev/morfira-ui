import { resolveTableOptions } from '@morfira-dev/core/table';
import type { TableOptions } from '@morfira-dev/core/table';
import type { ComponentPropsWithoutRef, ReactElement, Ref } from 'react';

type NativeTableProps = Omit<ComponentPropsWithoutRef<'table'>, keyof TableOptions>;

export interface TableProps extends NativeTableProps, TableOptions {
  readonly ref?: Ref<HTMLTableElement>;
}

export function Table({
  density = 'comfortable',
  hoverable = false,
  ref,
  stickyHeader = false,
  striped = false,
  ...nativeProps
}: TableProps): ReactElement {
  const options = resolveTableOptions({ density, hoverable, stickyHeader, striped });

  return (
    <table
      {...nativeProps}
      ref={ref}
      data-morfira-table=""
      data-density={options.density}
      data-striped={options.striped ? '' : undefined}
      data-hoverable={options.hoverable ? '' : undefined}
      data-sticky-header={options.stickyHeader ? '' : undefined}
    />
  );
}
