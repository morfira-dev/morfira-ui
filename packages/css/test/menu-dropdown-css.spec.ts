import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const read = async (name: string): Promise<string> =>
  readFile(new URL(`../src/${name}.css`, import.meta.url), 'utf8');

describe('Menu and Dropdown CSS contracts', () => {
  it('uses low-specificity hooks, logical layout, and semantic tokens', async () => {
    const menu = await read('menu');
    const dropdown = await read('dropdown');
    expect(menu).toContain(':where([data-morfira-menu-item])');
    expect(menu).toContain('text-align: start');
    expect(menu).toContain('var(--morfira-focus-ring)');
    expect(dropdown).toContain('inset-inline-start');
    expect(dropdown).toContain('var(--morfira-surface-raised)');
    expect(dropdown).toContain('[data-morfira-dropdown][hidden]');
    expect(dropdown).toContain('display: none');
    expect(dropdown).not.toContain('left:');
    expect(dropdown).not.toContain('right:');
  });

  it('retains forced-color meaning and removes reduced motion', async () => {
    const menu = await read('menu');
    const dropdown = await read('dropdown');
    expect(menu).toContain('@media (forced-colors: active)');
    expect(menu).toContain('GrayText');
    expect(dropdown).toContain('@media (prefers-reduced-motion: reduce)');
    expect(dropdown).toContain('animation: none');
    expect(dropdown).toContain('@media (forced-colors: active)');
  });

  it('defines logical placements with an RTL contract', async () => {
    const dropdown = await read('dropdown');
    for (const placement of [
      'block-start',
      'block-end',
      'inline-start',
      'inline-end',
    ]) {
      expect(dropdown).toContain(`[data-placement='${placement}']`);
    }
    expect(dropdown).toContain("[data-direction='rtl']");
  });
});
