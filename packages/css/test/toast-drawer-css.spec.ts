import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (name: string) =>
  readFile(resolve(process.cwd(), `packages/css/src/${name}.css`), 'utf8');
const [toast, drawer] = await Promise.all(['toast', 'drawer'].map(read));

describe('Toast and Drawer CSS contracts', () => {
  it('styles every Toast tone, logical accent, focus, and rendering mode', () => {
    expect(toast).toContain('[data-morfira-toast]');
    for (const tone of ['info', 'success', 'warning', 'danger']) {
      expect(toast).toContain(`[data-tone='${tone}']`);
    }
    expect(toast).toContain('border-inline-start');
    expect(toast).toContain('[data-morfira-toast][hidden]');
    expect(toast).toContain(':focus-visible');
    expect(toast).toContain('@media (prefers-reduced-motion: reduce)');
    expect(toast).toContain('@media (forced-colors: active)');
    expect(toast).not.toMatch(/\b(?:margin|padding|border)-(?:left|right):/u);
  });

  it('keeps Drawer side, modal backdrop, responsive, and accessibility styles explicit', () => {
    expect(drawer).toContain("[data-side='inline-start']");
    expect(drawer).toContain("[data-side='inline-end']");
    expect(drawer).toContain("[data-size='sm']");
    expect(drawer).toContain("[data-size='lg']");
    expect(drawer).toContain('::backdrop');
    expect(drawer).toContain('100dvb');
    expect(drawer).toContain("[dir='rtl']");
    expect(drawer).toContain('@media (max-width: 40rem)');
    expect(drawer).toContain('@media (prefers-reduced-motion: reduce)');
    expect(drawer).toContain('@media (forced-colors: active)');
    expect(drawer).not.toMatch(/\b(?:margin|padding|border)-(?:left|right):/u);
  });
});
