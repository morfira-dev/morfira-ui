import { renderToString } from 'vue/server-renderer';
import { createSSRApp, h } from 'vue';
import type { VNodeChild } from 'vue';
import { describe, expect, it } from 'vitest';

import { Accordion } from '../src/accordion/index.js';
import type { AccordionProps } from '../src/accordion/index.js';
import { Checkbox } from '../src/checkbox/index.js';
import type { CheckboxProps } from '../src/checkbox/index.js';
import { Field } from '../src/field/index.js';
import { Popover } from '../src/popover/index.js';
import { Radio } from '../src/radio/index.js';
import { Select } from '../src/select/index.js';
import { Switch } from '../src/switch/index.js';
import { Tabs } from '../src/tabs/index.js';
import { Textarea } from '../src/textarea/index.js';
import { Tooltip } from '../src/tooltip/index.js';

const render = async (
  component: Parameters<typeof h>[0],
  props: object,
  slots?: Record<string, () => VNodeChild>,
) => renderToString(createSSRApp({ render: () => h(component, props, slots) }));

describe('Vue Phase 2 adapters', () => {
  it('retains native public prop surfaces', () => {
    const checkbox = {
      modelValue: true,
      name: 'terms',
      class: 'terms-checkbox',
      'aria-label': 'Accept terms',
    } satisfies CheckboxProps & InstanceType<typeof Checkbox>['$props'];
    const accordion = {
      items: [],
      id: 'settings',
      class: 'settings-accordion',
    } satisfies AccordionProps & InstanceType<typeof Accordion>['$props'];
    expect(checkbox.name).toBe('terms');
    expect(accordion.id).toBe('settings');
  });

  it('renders native binary controls with stable public states', async () => {
    const markup = await render(
      'div',
      {},
      {
        default: () => [
          h(Checkbox, {
            modelValue: true,
            indeterminate: true,
            size: 'lg',
            name: 'all',
          }),
          h(Radio, { modelValue: 'daily', value: 'daily', name: 'cadence' }),
          h(Switch, { modelValue: true, name: 'alerts' }),
        ],
      },
    );
    expect(markup).toContain('data-morfira-checkbox');
    expect(markup).toContain('aria-checked="mixed"');
    expect(markup).toContain('data-indeterminate');
    expect(markup).toContain('data-morfira-radio');
    expect(markup).toContain('value="daily"');
    expect(markup).toContain('data-morfira-switch');
    expect(markup).toContain('role="switch"');
    expect(markup).toContain('aria-checked="true"');
  });

  it('composes Textarea and Select with Field associations', async () => {
    const textarea = await render(
      Field,
      {
        ids: {
          inputId: 'notes',
          labelId: 'notes-label',
          validationMessageId: 'notes-error',
        },
        label: 'Notes',
        validation: 'error',
        validationMessage: 'Required',
      },
      { default: () => h(Textarea, { modelValue: 'Draft', resize: 'none' }) },
    );
    expect(textarea).toContain('data-morfira-textarea');
    expect(textarea).toContain('id="notes"');
    expect(textarea).toContain('aria-invalid="true"');
    expect(textarea).toContain('data-resize="none"');

    const select = await render(
      Field,
      {
        ids: { inputId: 'region', labelId: 'region-label' },
        label: 'Region',
        size: 'lg',
      },
      {
        default: () =>
          h(
            Select,
            { modelValue: 'eu', visibleRows: 2 },
            {
              default: () => [
                h('option', { value: 'eu' }, 'Europe'),
                h('option', { value: 'us' }, 'US'),
              ],
            },
          ),
      },
    );
    expect(select).toContain('data-morfira-select');
    expect(select).toContain('id="region"');
    expect(select).toContain('size="2"');
    expect(select).toContain('data-size="lg"');
  });

  it('renders Tooltip and Popover trigger relationships during SSR', async () => {
    const tooltip = await render(
      Tooltip,
      { contentId: 'save-tip', content: 'Save changes', modelValue: true },
      { default: () => h('button', { type: 'button' }, 'Save') },
    );
    expect(tooltip).toContain('aria-describedby="save-tip"');
    expect(tooltip).toContain('role="tooltip"');
    expect(tooltip).toContain('data-state="open"');

    const popover = await render(
      Popover,
      {
        contentId: 'filters',
        ariaLabel: 'Filters',
        content: 'Filter form',
        modelValue: false,
      },
      { default: () => h('button', { type: 'button' }, 'Filters') },
    );
    expect(popover).toContain('aria-controls="filters"');
    expect(popover).toContain('aria-expanded="false"');
    expect(popover).toContain('role="dialog"');
    expect(popover).toContain('hidden');
  });

  it('renders deterministic Tabs and Accordion relationships', async () => {
    const tabs = await render(Tabs, {
      modelValue: 'overview-tab',
      items: [
        {
          tabId: 'overview-tab',
          panelId: 'overview-panel',
          label: 'Overview',
          content: 'Overview content',
        },
        {
          tabId: 'audit-tab',
          panelId: 'audit-panel',
          label: 'Audit',
          content: 'Audit content',
        },
      ],
    });
    expect(tabs).toContain('role="tablist"');
    expect(tabs).toContain('data-morfira-tabs-root');
    expect(tabs).toMatch(/role="tablist"[^>]*data-morfira-tabs/);
    expect(tabs).toMatch(/role="tablist"[^>]*data-orientation="horizontal"/);
    expect(tabs).toContain('aria-selected="true"');
    expect(tabs).toContain('aria-controls="overview-panel"');
    expect(tabs).toContain('aria-labelledby="overview-tab"');

    const accordion = await render(Accordion, {
      modelValue: ['account-trigger'],
      items: [
        {
          triggerId: 'account-trigger',
          panelId: 'account-panel',
          title: 'Account',
          content: 'Account content',
        },
        {
          triggerId: 'security-trigger',
          panelId: 'security-panel',
          title: 'Security',
          content: 'Security content',
        },
      ],
    });
    expect(accordion).toContain('aria-expanded="true"');
    expect(accordion).toMatch(/<details[^>]*open/);
    expect(accordion).toMatch(/<summary[^>]*data-morfira-accordion-trigger/);
    expect(accordion).toContain('aria-controls="account-panel"');
    expect(accordion).toContain('role="region"');
    expect(accordion).toContain('aria-labelledby="account-trigger"');
  });
});
