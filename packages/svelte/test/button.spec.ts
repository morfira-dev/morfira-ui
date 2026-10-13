import { readFile } from 'node:fs/promises';

import { compile } from 'svelte/compiler';
import { describe, expect, it } from 'vitest';

describe('Svelte Button', () => {
  it('compiles as a current Svelte 5 component without warnings', async () => {
    const filename = new URL('../src/button/Button.svelte', import.meta.url);
    const source = await readFile(filename, 'utf8');
    const result = compile(source, {
      filename: filename.pathname,
      generate: 'server',
      modernAst: true,
    });

    expect(result.warnings).toEqual([]);
    expect(result.js.code.length).toBeGreaterThan(0);
  });
});
