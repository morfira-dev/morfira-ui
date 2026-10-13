import { describe, expect, it } from 'vitest';

import { TABLE_DENSITIES, resolveTableOptions } from '../src/table.js';

describe('resolveTableOptions', () => {
  it('uses a comfortable static table by default', () => {
    expect(resolveTableOptions()).toEqual({
      density: 'comfortable',
      striped: false,
      hoverable: false,
      stickyHeader: false,
    });
  });

  it('resolves each independent visual behavior', () => {
    expect(
      resolveTableOptions({
        density: 'compact',
        striped: true,
        hoverable: true,
        stickyHeader: true,
      }),
    ).toEqual({
      density: 'compact',
      striped: true,
      hoverable: true,
      stickyHeader: true,
    });
  });

  it('exposes stable density values', () => {
    expect(TABLE_DENSITIES).toEqual(['compact', 'comfortable', 'spacious']);
  });
});
