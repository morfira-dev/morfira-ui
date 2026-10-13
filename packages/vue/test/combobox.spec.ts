import { renderToString } from 'vue/server-renderer';
import { createSSRApp, h } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { Autocomplete } from '../src/autocomplete/index.js';
import { Combobox } from '../src/combobox/index.js';

const options = [
  { id: 'alpha-option', value: 'alpha', label: 'Alpha' },
  { id: 'beta-option', value: 'beta', label: 'Beta', disabled: true },
] as const;
const render = (component: Parameters<typeof h>[0], props: object) =>
  renderToString(createSSRApp({ render: () => h(component, props) }));

describe('Vue Combobox and Autocomplete', () => {
  it('renders deterministic closed SSR relationships without loading', async () => {
    const loader = vi.fn(() => Promise.resolve(options));
    const markup = await render(Combobox, {
      inputId: 'project-search',
      listboxId: 'project-results',
      options,
      modelValue: 'alpha',
      defaultQuery: 'Alpha',
      loadOptions: loader,
    });
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('aria-controls="project-results"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('role="listbox"');
    expect(markup).toMatch(/role="listbox"[^>]*hidden/u);
    expect(loader).not.toHaveBeenCalled();
  });

  it('renders free Autocomplete text', async () => {
    const markup = await render(Autocomplete, {
      inputId: 'owner-search',
      listboxId: 'owner-results',
      options,
      modelValue: 'custom owner',
    });
    expect(markup).toContain('value="custom owner"');
    expect(markup).toContain('aria-autocomplete="list"');
  });
});
