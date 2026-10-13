import { readFile } from 'node:fs/promises';
import { compile } from 'svelte/compiler';
import { describe, expect, it } from 'vitest';

describe('Svelte Menu and Dropdown adapters', () => {
  for (const [directory, name] of [
    ['menu', 'Menu'],
    ['dropdown', 'Dropdown'],
  ] as const) {
    it(`compiles ${name} for client and server without warnings`, async () => {
      const filename = new URL(`../src/${directory}/${name}.svelte`, import.meta.url);
      const source = await readFile(filename, 'utf8');
      for (const generate of ['client', 'server'] as const) {
        const result = compile(source, {
          filename: filename.pathname,
          generate,
          modernAst: true,
        });
        expect(result.warnings).toEqual([]);
        expect(result.js.code.length).toBeGreaterThan(0);
      }
    });
  }

  it('uses menu semantics and bindable disclosure state', async () => {
    const [menu, dropdown] = await Promise.all([
      readFile(new URL('../src/menu/Menu.svelte', import.meta.url), 'utf8'),
      readFile(new URL('../src/dropdown/Dropdown.svelte', import.meta.url), 'utf8'),
    ]);
    expect(menu).toContain('role="menu"');
    expect(menu).toContain('role="menuitem"');
    expect(dropdown).toContain('open = $bindable(false)');
    expect(dropdown).toContain('aria-haspopup="menu"');
  });
});
