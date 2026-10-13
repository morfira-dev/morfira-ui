import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = await readFile(
  resolve(process.cwd(), 'packages/css/src/table.css'),
  'utf8',
);

describe('Table CSS contract', () => {
  it('covers native table anatomy and changes geometry at every density', () => {
    expect(css).toContain('table[data-morfira-table]');
    expect(css).toContain(':where(th, td)');
    expect(css).toContain("[data-density='compact']");
    expect(css).toContain("[data-density='spacious']");
    expect(css).toContain('--morfira-table-cell-padding-block');
    expect(css).toContain('--morfira-table-cell-padding-inline');
  });

  it('keeps selection, sorting, overflow, RTL, and forced colors explicit', () => {
    expect(css).toContain('[data-morfira-table-container]');
    expect(css).toContain('overflow: auto');
    expect(css).toContain('tr[data-selected]');
    expect(css).toContain('box-shadow: inset');
    expect(css).toContain('th[aria-sort] > button');
    expect(css).toContain("[dir='rtl']");
    expect(css).toContain('@media (forced-colors: active)');
    expect(css).not.toMatch(/\b(?:margin|padding|border)-(?:left|right):/u);
  });
});
