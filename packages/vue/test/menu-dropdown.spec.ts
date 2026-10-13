import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';

import { Dropdown } from '../src/dropdown/index.js';
import { Menu } from '../src/menu/index.js';

const items = [
  { id: 'deploy', textValue: 'Deploy', label: 'Deploy' },
  { id: 'delete', textValue: 'Delete', label: 'Delete', disabled: true },
] as const;

describe('Vue Menu and Dropdown SSR', () => {
  it('renders semantic menu states', async () => {
    const markup = await renderToString(
      createSSRApp({ render: () => h(Menu, { ariaLabel: 'Actions', items }) }),
    );
    expect(markup).toContain('role="menu"');
    expect(markup).toContain('role="menuitem"');
    expect(markup).toContain('aria-disabled="true"');
  });

  it('renders deterministic disclosure relationships', async () => {
    const markup = await renderToString(
      createSSRApp({
        render: () =>
          h(
            Dropdown,
            { contentId: 'release-menu', ariaLabel: 'Release actions', items },
            { default: () => h('button', { type: 'button' }, 'Actions') },
          ),
      }),
    );
    expect(markup).toContain('aria-controls="release-menu"');
    expect(markup).toContain('aria-haspopup="menu"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('hidden');
  });
});
