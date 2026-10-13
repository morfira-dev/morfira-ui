import { renderToString } from 'vue/server-renderer';
import { createSSRApp, h } from 'vue';
import { describe, expect, it } from 'vitest';

import { Button } from '../src/button/index.js';
import type { ButtonProps } from '../src/button/index.js';

describe('Vue Button', () => {
  it('exposes native button attributes through its public props', () => {
    type PublicButtonProps = InstanceType<typeof Button>['$props'];

    const props = {
      id: 'confirm',
      name: 'intent',
      form: 'account-form',
      class: 'primary-action',
      'aria-label': 'Confirm changes',
      onClick: (): void => undefined,
    } satisfies ButtonProps & PublicButtonProps;

    expect(props.form).toBe('account-form');
  });

  it('renders slots, attrs, and native-safe defaults', async () => {
    const app = createSSRApp({
      render: () => h(Button, { id: 'confirm' }, { default: () => 'Confirm' }),
    });

    const markup = await renderToString(app);

    expect(markup).toContain('type="button"');
    expect(markup).toContain('id="confirm"');
    expect(markup).toMatch(/data-morfira-button(?:="")?/);
    expect(markup).toContain('data-variant="primary"');
    expect(markup).toContain('data-size="md"');
    expect(markup).not.toContain('data-loading');
  });

  it('maps loading to native disabled and busy state', async () => {
    const app = createSSRApp({
      render: () =>
        h(Button, { loading: true, variant: 'danger' }, { default: () => 'Delete' }),
    });

    const markup = await renderToString(app);

    expect(markup).toContain('disabled');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toMatch(/data-loading(?:="")?/);
    expect(markup).toContain('data-variant="danger"');
  });
});
