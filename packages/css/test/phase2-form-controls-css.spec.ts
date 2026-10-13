import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const names = ['checkbox', 'radio', 'switch', 'textarea', 'select'] as const;
const styles = Object.fromEntries(
  await Promise.all(
    names.map(
      async (name) =>
        [
          name,
          await readFile(
            resolve(process.cwd(), `packages/css/src/${name}.css`),
            'utf8',
          ),
        ] as const,
    ),
  ),
) as Record<(typeof names)[number], string>;

describe('Phase 2 form control CSS contracts', () => {
  it('ships isolated low-specificity component layers', () => {
    for (const name of names) {
      expect(styles[name]).toContain('@layer morfira.components');
      expect(styles[name]).toContain(`data-morfira-${name}`);
      expect(styles[name]).toContain(':where(');
    }
  });

  it('covers focus, disabled, forced colors, and reduced motion', () => {
    for (const name of names) {
      expect(styles[name]).toContain(':focus-visible');
      expect(styles[name]).toContain(':disabled');
      expect(styles[name]).toContain('@media (forced-colors: active)');
      expect(styles[name]).toContain('@media (prefers-reduced-motion: reduce)');
    }
  });

  it('maps public sizes to visible geometry', () => {
    for (const name of names) {
      expect(styles[name]).toContain("[data-size='sm']");
      expect(styles[name]).toContain("[data-size='lg']");
    }
    expect(styles.checkbox).toContain('--morfira-checkbox-size:');
    expect(styles.radio).toContain('--morfira-radio-size:');
    expect(styles.switch).toContain('--morfira-switch-block-size:');
    expect(styles.textarea).toContain('--morfira-textarea-min-block-size:');
    expect(styles.select).toContain('--morfira-select-size:');
    expect(styles.checkbox).toContain('--morfira-checkbox-size: 1.5rem');
    expect(styles.radio).toContain('--morfira-radio-size: 1.5rem');
    expect(styles.switch).toContain('--morfira-switch-block-size: 1.5rem');
  });

  it('covers form-control-specific states', () => {
    expect(styles.checkbox).toContain('[data-indeterminate]');
    expect(styles.radio).toContain(':checked');
    expect(styles.switch).toContain(':checked');
    expect(styles.textarea).toContain("[data-resize='none']");
    expect(styles.textarea).toContain("[data-resize='both']");
    expect(styles.select).toContain('[data-multiple]');
    for (const name of ['textarea', 'select'] as const) {
      for (const validation of ['error', 'warning', 'success']) {
        expect(styles[name]).toContain(`[data-validation='${validation}']`);
      }
    }
  });

  it('keeps Switch states distinct across light and dark surfaces', () => {
    expect(styles.switch).toContain('solid var(--morfira-content-secondary)');
    expect(styles.switch).toContain('background-color: var(--morfira-border-strong)');
    expect(styles.switch).toContain('var(--morfira-interactive-primary-content) 0 62%');
    expect(styles.switch).toContain(
      'var(--morfira-interactive-disabled-content) 0 62%',
    );
    expect(styles.switch).toContain(':dir(rtl)');
    expect(styles.radio).toContain('var(--morfira-interactive-disabled-content)');
    expect(styles.radio).toContain('var(--morfira-interactive-disabled-content) 0 30%');
    expect(styles.radio).toContain(
      ':where(input[data-morfira-radio]):disabled:checked',
    );
  });

  it('uses logical spacing and sizing declarations', () => {
    const combined = Object.values(styles).join('\n');
    expect(combined).toContain('inline-size:');
    expect(combined).toContain('block-size:');
    expect(combined).not.toMatch(/\b(?:margin|padding|border)-(?:left|right):/);
  });
});
