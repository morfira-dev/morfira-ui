import { renderToString } from 'vue/server-renderer';
import { createSSRApp, h } from 'vue';
import { describe, expect, it } from 'vitest';

import { Dialog } from '../src/dialog/index.js';
import type { DialogProps } from '../src/dialog/index.js';

describe('Vue Dialog', () => {
  it('exposes native dialog attributes and the dialog element through its public type', () => {
    type PublicDialogProps = InstanceType<typeof Dialog>['$props'];
    type PublicDialogElement = InstanceType<typeof Dialog>['element'];

    const props = {
      open: false,
      ids: { titleId: 'settings-title' },
      id: 'settings-dialog',
      title: 'Settings',
      closeLabel: 'Close settings',
      class: 'settings-dialog',
      'aria-label': 'Settings dialog',
      onDismiss: (): void => undefined,
    } satisfies DialogProps & PublicDialogProps;
    const element: PublicDialogElement = null;

    expect(props.class).toBe('settings-dialog');
    expect(element).toBeNull();
  });

  it('renders deterministic native dialog markup without opening during SSR', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          Dialog,
          {
            open: true,
            ids: {
              titleId: 'delete-title',
              descriptionId: 'delete-description',
            },
            id: 'delete-dialog',
            title: 'Delete account',
            description: 'This action cannot be undone.',
            closeLabel: 'Close dialog',
            size: 'lg',
            class: 'danger-dialog',
            'data-consumer': 'account',
          },
          {
            default: () => 'Review the account before deleting it.',
            footer: () => h('button', { type: 'button' }, 'Delete'),
          },
        ),
    });

    const markup = await renderToString(app);

    expect(markup).toContain('<dialog');
    expect(markup).not.toMatch(/<dialog[^>]*\sopen(?:=|\s|>)/u);
    expect(markup).toContain('id="delete-dialog"');
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain('aria-labelledby="delete-title"');
    expect(markup).toContain('aria-describedby="delete-description"');
    expect(markup).toContain('data-state="open"');
    expect(markup).toContain('data-size="lg"');
    expect(markup).toContain('class="danger-dialog"');
    expect(markup).toContain('data-consumer="account"');
    expect(markup).toMatch(/data-morfira-dialog-footer(?:="")?/u);
    expect(markup).toContain('aria-label="Close dialog"');
  });

  it('requires description content and its ID together', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          Dialog,
          {
            open: false,
            ids: { titleId: 'settings-title' },
            title: 'Settings',
            description: 'Account preferences',
            closeLabel: 'Close settings',
          },
          { default: () => 'Settings body' },
        ),
    });

    await expect(renderToString(app)).rejects.toThrow(
      'Dialog description and ids.descriptionId must be provided together.',
    );
  });
});
