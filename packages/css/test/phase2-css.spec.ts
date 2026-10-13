import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (name: string) =>
  readFile(resolve(process.cwd(), `packages/css/src/${name}.css`), 'utf8');
const [tooltip, popover, tabs, accordion] = await Promise.all(
  ['tooltip', 'popover', 'tabs', 'accordion'].map(read),
);

describe('Phase 2 composite CSS contracts', () => {
  it('keeps Tooltip and Popover placement, motion, RTL, and forced-color states explicit', () => {
    for (const css of [tooltip, popover]) {
      expect(css).toContain('@layer morfira.components');
      for (const placement of [
        'block-start',
        'block-end',
        'inline-start',
        'inline-end',
      ])
        expect(css).toContain(`[data-placement='${placement}']`);
      expect(css).toContain("[dir='rtl']");
      expect(css).toContain('@media (prefers-reduced-motion: reduce)');
      expect(css).toContain('@media (forced-colors: active)');
      expect(css).not.toMatch(/\b(?:margin|padding|border)-(?:left|right):/u);
    }
    expect(tooltip).toContain('pointer-events: auto');
    expect(popover).toContain('100dvb');
  });

  it('styles Tabs orientation, selection, focus, disabled state, and touch targets', () => {
    expect(tabs).toContain('[data-morfira-tabs]');
    expect(tabs).toContain("[data-orientation='vertical']");
    expect(tabs).toContain("[data-state='active']");
    expect(tabs).toContain(':focus-visible');
    expect(tabs).toContain("[aria-disabled='true']");
    expect(tabs).toContain('var(--morfira-control-touch-target)');
    expect(tabs).toContain('@media (forced-colors: active)');
  });

  it('styles native Accordion details and summary semantics in every rendering mode', () => {
    expect(accordion).toContain('details[data-morfira-accordion-item]');
    expect(accordion).toContain('summary[data-morfira-accordion-trigger]');
    expect(accordion).toContain('::-webkit-details-marker');
    expect(accordion).toContain(':focus-visible');
    expect(accordion).toContain('@media (prefers-reduced-motion: reduce)');
    expect(accordion).toContain('@media (forced-colors: active)');
    expect(accordion).not.toMatch(/\b(?:margin|padding|border)-(?:left|right):/u);
  });
});
