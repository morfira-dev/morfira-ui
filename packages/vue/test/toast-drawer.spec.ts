import { renderToString } from 'vue/server-renderer';
import { createSSRApp, h } from 'vue';
import { describe, expect, it } from 'vitest';

import { Drawer } from '../src/drawer/index.js';
import { Toast } from '../src/toast/index.js';

const render = (component: Parameters<typeof h>[0], props: object, slots: object) =>
  renderToString(createSSRApp({ render: () => h(component, props, slots) }));

describe('Vue Toast and Drawer adapters', () => {
  it('renders Toast live-region policy during SSR', async () => {
    const markup = await render(
      Toast,
      {
        modelValue: true,
        tone: 'success',
        duration: null,
        title: 'Saved',
        closeLabel: 'Dismiss',
      },
      { default: () => 'Configuration saved.' },
    );
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('data-tone="success"');
  });

  it('renders Drawer relationships without a native open attribute', async () => {
    const markup = await render(
      Drawer,
      {
        modelValue: true,
        ids: { titleId: 'drawer-title' },
        title: 'Details',
        closeLabel: 'Close details',
      },
      { default: () => 'Drawer body' },
    );
    expect(markup).toContain('data-state="open"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).not.toMatch(/<dialog[^>]*\sopen(?:=|\s|>)/u);
  });
});
