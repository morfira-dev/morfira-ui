import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const dialogCss = await readFile(
  resolve(process.cwd(), 'packages/css/src/dialog.css'),
  'utf8',
);
const packageManifest = await readFile(
  resolve(process.cwd(), 'packages/css/package.json'),
  'utf8',
);

describe('dialog CSS contract', () => {
  it('styles the native top-layer surface and backdrop through isolated hooks', () => {
    expect(dialogCss).toContain('@layer morfira.components');
    expect(dialogCss).toContain('dialog[data-morfira-dialog]');
    expect(dialogCss).toContain('dialog[data-morfira-dialog][open]');
    expect(dialogCss).toContain('::backdrop');
    expect(dialogCss).toContain('[data-morfira-dialog-header]');
    expect(dialogCss).toContain('[data-morfira-dialog-body]');
    expect(dialogCss).toContain('[data-morfira-dialog-footer]');
  });

  it('maps every size to distinct visible inline geometry capped by the viewport', () => {
    expect(dialogCss).toMatch(
      /\[data-size='sm'\][^{]*\{[^}]*--morfira-dialog-inline-size:\s*26rem/su,
    );
    expect(dialogCss).toMatch(
      /dialog\[data-morfira-dialog\][^,{]*\)[^{]*\{[^}]*--morfira-dialog-inline-size:\s*36rem/su,
    );
    expect(dialogCss).toMatch(
      /\[data-size='lg'\][^{]*\{[^}]*--morfira-dialog-inline-size:\s*48rem/su,
    );
    expect(dialogCss).toContain('inline-size: min(');
    expect(dialogCss).toContain('100vi - var(--morfira-dialog-viewport-gap)');
  });

  it('keeps header and footer visible while only the body scrolls', () => {
    expect(dialogCss).toContain('grid-template-rows: auto minmax(0, 1fr) auto');
    expect(dialogCss).toMatch(
      /\[data-morfira-dialog-body\][^{]*\{[^}]*min-block-size:\s*0[^}]*overflow:\s*auto/su,
    );
    expect(dialogCss).toContain('100dvb');
  });

  it('keeps the heading flexible and the close control pinned inline-end', () => {
    expect(dialogCss).toMatch(
      /\[data-morfira-dialog-header\] > :first-child[^{]*\{[^}]*flex:\s*1 1 auto[^}]*min-inline-size:\s*0/su,
    );
    expect(dialogCss).toMatch(
      /button\[data-morfira-dialog-close\][^{]*\{[^}]*align-self:\s*flex-start[^}]*margin-inline-start:\s*auto/su,
    );
  });

  it('uses logical properties and preserves accessibility rendering modes', () => {
    expect(dialogCss).toContain('padding-inline:');
    expect(dialogCss).toContain('margin-inline-end:');
    expect(dialogCss).toContain(':focus-visible');
    expect(dialogCss).toContain('@media (forced-colors: active)');
    expect(dialogCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(dialogCss).not.toMatch(/\b(?:margin|padding|border)-(?:left|right):/u);
  });

  it('ships as an independent explicit CSS side effect', () => {
    expect(packageManifest).toContain('"./dialog.css": "./dist/dialog.css"');
    expect(packageManifest).toContain('"./dist/dialog.css"');
  });
});
