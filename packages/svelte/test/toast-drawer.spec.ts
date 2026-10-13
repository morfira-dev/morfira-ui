import { readFile } from 'node:fs/promises';
import { compile } from 'svelte/compiler';
import { describe, expect, it } from 'vitest';

const components = [
  ['toast', 'Toast'],
  ['drawer', 'Drawer'],
] as const;

describe('Svelte Toast and Drawer adapters', () => {
  for (const [directory, name] of components) {
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

  it('keeps open state bindable and delegates browser effects to DOM actions', async () => {
    const sources = await Promise.all(
      components.map(([directory, name]) =>
        readFile(
          new URL(`../src/${directory}/${name}.svelte`, import.meta.url),
          'utf8',
        ),
      ),
    );
    for (const source of sources) {
      expect(source).toContain('open = $bindable');
      expect(source).toContain('use:');
    }
  });
});
