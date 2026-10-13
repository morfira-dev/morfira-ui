import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Accordion } from '../src/accordion/index.js';
import { Tabs } from '../src/tabs/index.js';
import { resolveFocusedTabId } from '../src/tabs/Tabs.js';

describe('React Phase 2 disclosure components', () => {
  it('keeps manual roving focus independent from selection and repairs removed focus', () => {
    const items = [
      { tabId: 'account-tab', panelId: 'account-panel', disabled: false },
      { tabId: 'security-tab', panelId: 'security-panel', disabled: false },
    ];

    expect(resolveFocusedTabId(items, 'account-tab', 'security-tab')).toBe(
      'security-tab',
    );
    expect(resolveFocusedTabId(items.slice(0, 1), 'account-tab', 'security-tab')).toBe(
      'account-tab',
    );
  });

  it('renders deterministic tab and panel relationships', () => {
    const markup = renderToStaticMarkup(
      <Tabs
        selectedId="account-tab"
        items={[
          {
            tabId: 'account-tab',
            panelId: 'account-panel',
            label: 'Account',
            content: 'Account settings',
          },
          {
            tabId: 'security-tab',
            panelId: 'security-panel',
            label: 'Security',
            content: 'Security settings',
          },
        ]}
      />,
    );

    expect(markup).toContain('data-morfira-tabs-root=""');
    expect(markup).toContain('data-morfira-tabs=""');
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('id="account-tab"');
    expect(markup).toContain('aria-controls="account-panel"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('id="security-panel"');
    expect(markup).toContain('aria-labelledby="security-tab"');
    expect(markup).toContain('hidden=""');
  });

  it('renders controlled accordion headings and regions', () => {
    const markup = renderToStaticMarkup(
      <Accordion
        expandedIds={['general-trigger']}
        items={[
          {
            triggerId: 'general-trigger',
            panelId: 'general-panel',
            title: 'General',
            content: 'General settings',
          },
          {
            triggerId: 'advanced-trigger',
            panelId: 'advanced-panel',
            title: 'Advanced',
            content: 'Advanced settings',
          },
        ]}
      />,
    );

    expect(markup).toContain('<details');
    expect(markup).toContain('<summary');
    expect(markup).toContain('open=""');
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain('aria-controls="general-panel"');
    expect(markup).toContain('role="region"');
    expect(markup).toContain('aria-labelledby="advanced-trigger"');
    expect(markup).toContain('hidden=""');
  });
});
