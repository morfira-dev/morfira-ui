export const TABLE_DENSITIES = ['compact', 'comfortable', 'spacious'] as const;

export type TableDensity = (typeof TABLE_DENSITIES)[number];

export interface TableOptions {
  readonly density?: TableDensity;
  readonly striped?: boolean;
  readonly hoverable?: boolean;
  readonly stickyHeader?: boolean;
}

export interface ResolvedTableOptions {
  readonly density: TableDensity;
  readonly striped: boolean;
  readonly hoverable: boolean;
  readonly stickyHeader: boolean;
}

/** Resolves visual table options while leaving native table semantics untouched. */
export function resolveTableOptions(options: TableOptions = {}): ResolvedTableOptions {
  return {
    density: options.density ?? 'comfortable',
    striped: options.striped ?? false,
    hoverable: options.hoverable ?? false,
    stickyHeader: options.stickyHeader ?? false,
  };
}
