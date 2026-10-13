import { readFile } from 'node:fs/promises';
import { compile } from 'svelte/compiler';
import { describe, expect, it } from 'vitest';

describe('Svelte Combobox and Autocomplete', () => {
  for (const [directory, name] of [
    ['combobox', 'Combobox'],
    ['autocomplete', 'Autocomplete'],
  ] as const) {
    it(`compiles ${name} for server and client without warnings`, async () => {
      const filename = new URL(`../src/${directory}/${name}.svelte`, import.meta.url);
      const source = await readFile(filename, 'utf8');
      const server = compile(source, {
        filename: filename.pathname,
        generate: 'server',
        modernAst: true,
      });
      const client = compile(source, {
        filename: filename.pathname,
        generate: 'client',
        modernAst: true,
      });
      expect(server.warnings).toEqual([]);
      expect(client.warnings).toEqual([]);
      expect(server.js.code.length).toBeGreaterThan(0);
      expect(client.js.code.length).toBeGreaterThan(0);
    });
  }

  it('keeps focus ownership on the input through aria-activedescendant', async () => {
    const source = await readFile(
      new URL('../src/combobox/Combobox.svelte', import.meta.url),
      'utf8',
    );
    expect(source).toContain('role="combobox"');
    expect(source).toContain('aria-activedescendant');
    expect(source).toContain('role="listbox"');
    expect(source).toContain('role="option"');
    expect(source).toContain('gate.invalidate()');
  });
});
