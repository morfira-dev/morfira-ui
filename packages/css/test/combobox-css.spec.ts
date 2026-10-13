import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = await readFile(
  resolve(process.cwd(), 'packages/css/src/combobox.css'),
  'utf8',
);

describe('Combobox CSS contract', () => {
  it('covers public anatomy and non-color states', () => {
    for (const hook of [
      'data-morfira-combobox',
      'data-morfira-combobox-input',
      'data-morfira-combobox-listbox',
      'data-morfira-combobox-option',
    ])
      expect(css).toContain(hook);
    expect(css).toContain('[data-active]');
    expect(css).toContain('[data-selected]');
    expect(css).toContain('outline:');
    expect(css).toContain('box-shadow: inset');
    expect(css).toContain('[data-morfira-combobox-option][hidden]');
  });

  it('is logical, RTL-aware, reduced-motion safe, and forced-color safe', () => {
    expect(css).toContain("[dir='rtl']");
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('@media (forced-colors: active)');
    expect(css).toContain('50dvb');
    expect(css).not.toMatch(/\b(?:margin|padding|border)-(?:left|right):/u);
  });
});
