import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const fieldCss = await readFile(
  resolve(process.cwd(), 'packages/css/src/field.css'),
  'utf8',
);
const inputCss = await readFile(
  resolve(process.cwd(), 'packages/css/src/input.css'),
  'utf8',
);
const packageManifest = await readFile(
  resolve(process.cwd(), 'packages/css/package.json'),
  'utf8',
);

describe('field and input CSS contracts', () => {
  it('uses isolated low-specificity public hooks', () => {
    expect(fieldCss).toContain('@layer morfira.components');
    expect(fieldCss).toContain(':where([data-morfira-field])');
    expect(fieldCss).toContain('[data-morfira-field-label]');
    expect(fieldCss).toContain('[data-morfira-field-required]');
    expect(fieldCss).toContain('[data-morfira-field-message]');

    expect(inputCss).toContain('@layer morfira.components');
    expect(inputCss).toContain('input[data-morfira-input]');
    expect(inputCss).toContain('[data-morfira-field-control]');
    expect(inputCss).toContain('[data-morfira-field-prefix]');
    expect(inputCss).toContain('[data-morfira-field-suffix]');
  });

  it('covers sizes and validation states', () => {
    for (const size of ['sm', 'lg']) {
      expect(inputCss).toContain(`[data-size='${size}']`);
    }

    for (const validation of ['none', 'error', 'warning', 'success']) {
      expect(fieldCss).toContain(`[data-validation='${validation}']`);
      expect(inputCss).toContain(`[data-validation='${validation}']`);
    }

    for (const validation of ['error', 'warning', 'success']) {
      expect(fieldCss).toContain(`[data-message-kind='${validation}']`);
    }

    expect(fieldCss).toContain("[data-message-kind='helper']");
  });

  it('distinguishes disabled and readonly behavior', () => {
    expect(inputCss).toContain(':disabled');
    expect(inputCss).toContain('[readonly]');
    expect(inputCss).toContain('cursor: not-allowed');
    expect(inputCss).toContain('cursor: text');
  });

  it('keeps accessibility rendering modes in the contract', () => {
    expect(inputCss).toContain(':focus-visible');
    expect(inputCss).toContain(':focus-within');
    expect(inputCss).toContain('@media (forced-colors: active)');
    expect(inputCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(fieldCss).toContain('@media (forced-colors: active)');

    for (const cue of ["content: '×'", "content: '!'", "content: '✓'"]) {
      expect(fieldCss).toContain(cue);
    }
  });

  it('keeps one focus indicator when Input is composed inside Field', () => {
    expect(inputCss).toMatch(
      /\[data-morfira-field-control\][^{]*> input\[data-morfira-input\][^{]*\):focus-visible\s*\{\s*outline:\s*0;/su,
    );
  });

  it('uses logical sizing and spacing properties', () => {
    const styles = `${fieldCss}\n${inputCss}`;

    expect(styles).toContain('padding-inline:');
    expect(styles).toContain('min-inline-size:');
    expect(styles).toContain('min-block-size:');
    expect(styles).not.toMatch(/\b(?:margin|padding|border)-(?:left|right):/);
  });

  it('maps each size token to visible input and control geometry', () => {
    expect(inputCss).toContain('block-size: var(--morfira-input-size)');
    expect(inputCss).not.toContain('block-size: max(');

    expect(inputCss).toMatch(
      /\[data-size='sm'\][^{]*\{[^}]*--morfira-input-size:\s*var\(--morfira-control-size-sm\)/su,
    );
    expect(inputCss).toMatch(
      /--morfira-input-size:\s*var\(--morfira-control-size-md\)/u,
    );
    expect(inputCss).toMatch(
      /\[data-size='lg'\][^{]*\{[^}]*--morfira-input-size:\s*var\(--morfira-control-size-lg\)/su,
    );
  });

  it('ships independent explicit CSS side effects', () => {
    expect(packageManifest).toContain('"./field.css": "./dist/field.css"');
    expect(packageManifest).toContain('"./input.css": "./dist/input.css"');
    expect(packageManifest).toContain('"./dist/field.css"');
    expect(packageManifest).toContain('"./dist/input.css"');
  });
});
