import { readFile } from 'node:fs/promises';

import { compile } from 'svelte/compiler';
import type { Snippet } from 'svelte';
import { describe, expect, expectTypeOf, it } from 'vitest';

import type { FieldProps } from '../src/field/index.js';
import type { InputProps } from '../src/input/index.js';

const components = ['Field', 'Input'] as const;

describe('Svelte Field and Input', () => {
  it.each(components)('compiles %s for SSR without warnings', async (component) => {
    const directory = component.toLowerCase();
    const filename = new URL(
      `../src/${directory}/${component}.svelte`,
      import.meta.url,
    );
    const source = await readFile(filename, 'utf8');
    const result = compile(source, {
      filename: filename.pathname,
      generate: 'server',
      modernAst: true,
    });

    expect(result.warnings).toEqual([]);
    expect(result.js.code.length).toBeGreaterThan(0);
  });

  it('exposes explicit IDs and current Svelte bindings in its public types', () => {
    expectTypeOf<FieldProps>().toExtend<{
      ids: { inputId: string; labelId: string };
      label: string;
      children: Snippet;
    }>();
    expectTypeOf<InputProps>().toExtend<{
      value?: string | number;
      element?: HTMLInputElement | null;
    }>();
  });
});
