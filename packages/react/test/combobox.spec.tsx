import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Autocomplete } from '../src/autocomplete/index.js';
import { Combobox } from '../src/combobox/index.js';

const options = [
  { id: 'alpha-option', value: 'alpha', label: 'Alpha' },
  { id: 'beta-option', value: 'beta', label: 'Beta', disabled: true },
] as const;

describe('React Combobox and Autocomplete', () => {
  it('renders deterministic closed SSR relationships without loading', () => {
    const loader = vi.fn(() => Promise.resolve(options));
    const markup = renderToStaticMarkup(
      <Combobox
        inputId="project-search"
        listboxId="project-results"
        options={options}
        selectedValue="alpha"
        defaultQuery="Alpha"
        loadOptions={loader}
      />,
    );
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('aria-controls="project-results"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('role="listbox"');
    expect(markup).toContain('hidden=""');
    expect(loader).not.toHaveBeenCalled();
  });

  it('keeps Autocomplete free text distinct from option selection', () => {
    const markup = renderToStaticMarkup(
      <Autocomplete
        inputId="owner-search"
        listboxId="owner-results"
        options={options}
        value="custom owner"
      />,
    );
    expect(markup).toContain('value="custom owner"');
    expect(markup).toContain('aria-autocomplete="list"');
  });
});
