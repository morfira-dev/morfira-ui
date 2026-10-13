import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Drawer } from '../src/drawer/index.js';
import { Toast } from '../src/toast/index.js';

describe('React Toast and Drawer adapters', () => {
  it('renders deterministic Toast announcement semantics during SSR', () => {
    const markup = renderToString(
      <Toast
        open
        tone="danger"
        duration={null}
        title="Deploy failed"
        closeLabel="Dismiss"
      >
        Check the production logs.
      </Toast>,
    );
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('aria-live="assertive"');
    expect(markup).toContain('data-tone="danger"');
    expect(markup).toContain('data-morfira-toast-close');
  });

  it('keeps Drawer closed natively during SSR while exposing its controlled state', () => {
    const markup = renderToString(
      <Drawer
        open
        modal={false}
        ids={{ titleId: 'details-title', descriptionId: 'details-description' }}
        title="Release details"
        description="Inspect without blocking the page."
        closeLabel="Close details"
      >
        Drawer body
      </Drawer>,
    );
    expect(markup).toContain('data-state="open"');
    expect(markup).toContain('data-modal="false"');
    expect(markup).not.toContain('aria-modal=');
    expect(markup).not.toMatch(/<dialog[^>]*\sopen(?:=|\s|>)/u);
    expect(markup).toContain('aria-labelledby="details-title"');
  });
});
