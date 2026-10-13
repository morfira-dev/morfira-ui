import {
  resolveTableOptions,
  type ResolvedTableOptions,
  type TableOptions,
} from '@morfira-dev/core/table';

const ATTRIBUTES = [
  'data-morfira-table',
  'data-density',
  'data-striped',
  'data-hoverable',
  'data-sticky-header',
] as const;

export interface TableController {
  readonly state: ResolvedTableOptions;
  update(options: TableOptions): void;
  destroy(): void;
}

/** Enhances a native table with Morfira styling hooks only. */
export function enhanceTable(
  table: HTMLTableElement,
  initialOptions: TableOptions = {},
): TableController {
  const attributes = new Map(
    ATTRIBUTES.map((name) => [name, table.getAttribute(name)] as const),
  );
  let state = resolveTableOptions(initialOptions);
  let destroyed = false;

  const apply = (): void => {
    table.setAttribute('data-morfira-table', '');
    table.setAttribute('data-density', state.density);
    table.toggleAttribute('data-striped', state.striped);
    table.toggleAttribute('data-hoverable', state.hoverable);
    table.toggleAttribute('data-sticky-header', state.stickyHeader);
  };

  apply();
  return {
    get state() {
      return state;
    },
    update(options) {
      if (destroyed) return;
      state = resolveTableOptions(options);
      apply();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const [name, value] of attributes) {
        if (value === null) table.removeAttribute(name);
        else table.setAttribute(name, value);
      }
    },
  };
}
