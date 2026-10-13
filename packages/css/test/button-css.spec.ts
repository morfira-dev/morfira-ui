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
    expect(buttonCss).toContain('min-inline-size: var(--morfira-control-touch-target)');
    expect(buttonCss).toContain('@media (forced-colors: active)');
    expect(buttonCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(buttonCss).toContain('[data-loading])::before');
  });

  it('uses logical sizing and spacing properties', () => {
    expect(buttonCss).toContain('padding-inline:');
    expect(buttonCss).toContain('min-inline-size:');
    expect(buttonCss).toContain('block-size:');
    expect(buttonCss).not.toMatch(/\b(?:margin|padding|border)-(?:left|right):/);
  });

  it('maps each size token to visible button geometry', () => {
    expect(buttonCss).toContain('block-size: var(--morfira-button-size)');
    expect(buttonCss).not.toContain('block-size: max(');

    expect(buttonCss).toMatch(
      /\[data-size='sm'\][^{]*\{[^}]*--morfira-button-size:\s*var\(--morfira-control-size-sm\)/su,
    );
    expect(buttonCss).toMatch(
      /--morfira-button-size:\s*var\(--morfira-control-size-md\)/u,
    );
    expect(buttonCss).toMatch(
      /\[data-size='lg'\][^{]*\{[^}]*--morfira-button-size:\s*var\(--morfira-control-size-lg\)/su,
    );
  });

  it('ships as an independent, explicit CSS side effect', () => {
    expect(packageManifest).toContain('"./button.css": "./dist/button.css"');
    expect(packageManifest).toContain('"./dist/button.css"');
  });
});
