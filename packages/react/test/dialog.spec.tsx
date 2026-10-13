import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Dialog } from '../src/dialog/index.js';
import type { DialogProps } from '../src/dialog/index.js';

describe('React Dialog', () => {
  it('renders deterministic native dialog markup without opening during SSR', () => {
    const markup = renderToStaticMarkup(
      <Dialog
        open
        ids={{
          titleId: 'delete-title',
          descriptionId: 'delete-description',
        }}
        id="delete-dialog"
        title="Delete account"
        description="This action cannot be undone."
        closeLabel="Close dialog"
        footer={<button type="button">Delete</button>}
        size="lg"
        className="danger-dialog"
        data-consumer="account"
        onDismiss={() => undefined}
      >
        Review the account before deleting it.
      </Dialog>,
    );

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
    expect(markup).toContain('data-morfira-dialog-footer=""');
    expect(markup).toContain('aria-label="Close dialog"');
  });

  it('exposes native dialog attributes and an HTMLDialogElement ref', () => {
    const props = {
      open: false,
      ids: { titleId: 'settings-title' },
      id: 'settings-dialog',
      title: 'Settings',
      closeLabel: 'Close settings',
      children: 'Settings body',
      className: 'settings-dialog',
      'aria-label': 'Settings dialog',
      ref: (): void => undefined,
      onDismiss: (): void => undefined,
    } satisfies DialogProps;

    expect(props.className).toBe('settings-dialog');
  });

  it('requires description content and its ID together', () => {
    expect(() =>
      renderToStaticMarkup(
        <Dialog
          open={false}
          ids={{ titleId: 'settings-title' }}
          title="Settings"
          description="Account preferences"
          closeLabel="Close settings"
        >
          Settings body
        </Dialog>,
      ),
    ).toThrow('Dialog description and ids.descriptionId must be provided together.');
  });
});
