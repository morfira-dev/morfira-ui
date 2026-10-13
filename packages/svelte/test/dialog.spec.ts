import { readFile } from 'node:fs/promises';

import type { DialogDismissReason } from '@morfira-dev/core/dialog';
import { compile } from 'svelte/compiler';
import type { Snippet } from 'svelte';
import { describe, expect, expectTypeOf, it } from 'vitest';

import type { DialogProps } from '../src/dialog/index.js';

describe('Svelte Dialog', () => {
  it('compiles for SSR without browser access or warnings', async () => {
    const filename = new URL('../src/dialog/Dialog.svelte', import.meta.url);
    const source = await readFile(filename, 'utf8');
    const result = compile(source, {
      filename: filename.pathname,
      generate: 'server',
      modernAst: true,
    });

    expect(result.warnings).toEqual([]);
    expect(result.js.code.length).toBeGreaterThan(0);
  });

  it('exposes bindable state, explicit accessible IDs, snippets, and native attrs', () => {
    const children = (() => undefined) as unknown as Snippet;
    const props: DialogProps = {
      children,
      class: 'archive-dialog',
      closeLabel: 'Close archive confirmation',
      ids: { titleId: 'archive-title' },
      open: true,
      title: 'Archive workspace?',
    };

    expect(props.class).toBe('archive-dialog');
    expectTypeOf<DialogProps['ids']>().toExtend<{
      titleId: string;
      descriptionId?: string;
    }>();
    expectTypeOf<DialogProps['children']>().toEqualTypeOf<Snippet>();
    expectTypeOf<DialogProps['open']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<DialogProps['element']>().toEqualTypeOf<
      HTMLDialogElement | null | undefined
    >();

    expectTypeOf<NonNullable<DialogProps['onDismiss']>>().parameters.toEqualTypeOf<
      [DialogDismissReason]
    >();
    expectTypeOf<NonNullable<DialogProps['onOpenChange']>>().parameters.toEqualTypeOf<
      [boolean, DialogDismissReason]
    >();
  });

  it('uses the shared DOM enhancer and native dialog anatomy', async () => {
    const source = await readFile(
      new URL('../src/dialog/Dialog.svelte', import.meta.url),
      'utf8',
    );

    expect(source).toContain("from '@morfira-dev/dom/dialog'");
    expect(source).toContain('<dialog');
    expect(source).toContain('data-morfira-dialog=""');
    expect(source).toContain('data-morfira-dialog-body=""');
    expect(source).toContain("requestClose('close-button')");
    expect(source).not.toContain('document.');
    expect(source).not.toContain('window.');
  });
});
