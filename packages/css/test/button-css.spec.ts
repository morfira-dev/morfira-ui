import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const buttonCss = await readFile(
  resolve(process.cwd(), 'packages/css/src/button.css'),
  'utf8',
);
const packageManifest = await readFile(
  resolve(process.cwd(), 'packages/css/package.json'),
  'utf8',
);

describe('button CSS contract', () => {
  it('uses the public DOM states and an isolated component layer', () => {
    expect(buttonCss).toContain('@layer morfira.components');
    expect(buttonCss).toContain('button[data-morfira-button]');

    for (const variant of ['primary', 'secondary', 'ghost', 'danger']) {
      expect(buttonCss).toContain(`[data-variant='${variant}']`);
    }

    for (const size of ['sm', 'lg']) {
      expect(buttonCss).toContain(`[data-size='${size}']`);
    }

    expect(buttonCss).toContain('[data-loading]');
  });

  it('keeps accessibility modes in the component contract', () => {
    expect(buttonCss).toContain(':focus-visible');
    expect(buttonCss).toContain('var(--morfira-control-touch-target)');
    expect(buttonCss).toContain('@media (forced-colors: active)');
    expect(buttonCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(buttonCss).toContain('[data-loading])::before');
  });

  it('uses logical sizing and spacing properties', () => {
    expect(buttonCss).toContain('padding-inline:');
    expect(buttonCss).toContain('min-inline-size:');
    expect(buttonCss).toContain('min-block-size:');
    expect(buttonCss).not.toMatch(/\b(?:margin|padding|border)-(?:left|right):/);
  });

  it('ships as an independent, explicit CSS side effect', () => {
    expect(packageManifest).toContain('"./button.css": "./dist/button.css"');
    expect(packageManifest).toContain('"./dist/button.css"');
  });
});
