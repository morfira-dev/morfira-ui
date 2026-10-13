import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Dropdown } from '../src/dropdown/index.js';
import { Menu } from '../src/menu/index.js';

const items = [
  { id: 'deploy', textValue: 'Deploy', label: 'Deploy' },
  { id: 'delete', textValue: 'Delete', label: 'Delete', disabled: true },
] as const;

describe('React Menu and Dropdown SSR', () => {
  it('renders a semantic roving Menu', () => {
    const markup = renderToStaticMarkup(<Menu ariaLabel="Actions" items={items} />);
    expect(markup).toContain('role="menu"');
    expect(markup).toContain('role="menuitem"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('aria-disabled="true"');
  });

  it('renders deterministic closed Dropdown relationships', () => {
    const markup = renderToStaticMarkup(
      <Dropdown contentId="release-menu" ariaLabel="Release actions" items={items}>
        <button type="button">Actions</button>
      </Dropdown>,
    );
    expect(markup).toContain('aria-controls="release-menu"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-haspopup="menu"');
    expect(markup).toContain('id="release-menu"');
    expect(markup).toContain('hidden=""');
  });
});
