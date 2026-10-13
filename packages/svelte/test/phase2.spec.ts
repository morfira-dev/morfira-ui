import { readFile } from 'node:fs/promises';
import { compile } from 'svelte/compiler';
import { describe, expect, it } from 'vitest';

const components = [
  'accordion',
  'checkbox',
  'popover',
  'radio',
  'select',
  'switch',
  'tabs',
  'textarea',
  'tooltip',
] as const;
const names = {
  accordion: 'Accordion',
  checkbox: 'Checkbox',
  popover: 'Popover',
  radio: 'Radio',
  select: 'Select',
  switch: 'Switch',
  tabs: 'Tabs',
  textarea: 'Textarea',
  tooltip: 'Tooltip',
} as const;

describe('Svelte Phase 2 adapters', () => {
  for (const directory of components) {
    it(`compiles ${names[directory]} as a current Svelte 5 component without warnings`, async () => {
      const filename = new URL(
        `../src/${directory}/${names[directory]}.svelte`,
        import.meta.url,
      );
      const source = await readFile(filename, 'utf8');
      const serverResult = compile(source, {
        filename: filename.pathname,
        generate: 'server',
        modernAst: true,
      });
      const clientResult = compile(source, {
        filename: filename.pathname,
        generate: 'client',
        modernAst: true,
      });
      expect(serverResult.warnings).toEqual([]);
      expect(clientResult.warnings).toEqual([]);
      expect(serverResult.js.code.length).toBeGreaterThan(0);
      expect(clientResult.js.code.length).toBeGreaterThan(0);
    });
  }

  it('keeps Accordion on native details and summary semantics', async () => {
    const source = await readFile(
      new URL('../src/accordion/Accordion.svelte', import.meta.url),
      'utf8',
    );
    expect(source).toContain('<details');
    expect(source).toContain('<summary');
    expect(source).not.toContain('role="button"');
  });

  it('exposes bindable state for controlled and uncontrolled use', async () => {
    const sources = await Promise.all([
      readFile(new URL('../src/tooltip/Tooltip.svelte', import.meta.url), 'utf8'),
      readFile(new URL('../src/popover/Popover.svelte', import.meta.url), 'utf8'),
      readFile(new URL('../src/tabs/Tabs.svelte', import.meta.url), 'utf8'),
      readFile(new URL('../src/accordion/Accordion.svelte', import.meta.url), 'utf8'),
    ]);
    for (const source of sources) expect(source).toContain('$bindable');
  });

  it('keeps the Tabs styling hook on the semantic tablist', async () => {
    const source = await readFile(
      new URL('../src/tabs/Tabs.svelte', import.meta.url),
      'utf8',
    );
    expect(source).toContain('data-morfira-tabs-root=""');
    expect(source).toMatch(
      /role="tablist"[^>]*data-morfira-tabs=""[^>]*data-orientation=/u,
    );
  });

  it('models Radio with one bindable group value instead of stale checked state', async () => {
    const source = await readFile(
      new URL('../src/radio/Radio.svelte', import.meta.url),
      'utf8',
    );
    expect(source).toContain('group = $bindable()');
    expect(source).toContain('bind:group');
    expect(source).toContain('Object.is(group, value)');
    expect(source).not.toContain('checked = $bindable');
  });

  it('synchronizes bindable Switch state after native form reset', async () => {
    const source = await readFile(
      new URL('../src/switch/Switch.svelte', import.meta.url),
      'utf8',
    );
    expect(source).toContain("form.addEventListener('reset', handleReset)");
    expect(source).toContain('checked = input.checked');
    expect(source).toContain("form.removeEventListener('reset', handleReset)");
  });
});
