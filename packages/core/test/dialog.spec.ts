import { describe, expect, it } from 'vitest';

import {
  DIALOG_DISMISS_REASONS,
  DIALOG_SIZES,
  resolveDialogOptions,
} from '../src/dialog.js';

describe('resolveDialogOptions', () => {
  it('uses conservative modal defaults', () => {
    expect(resolveDialogOptions({ ids: { titleId: 'dialog-title' } })).toEqual({
      ids: { titleId: 'dialog-title' },
      open: false,
      size: 'md',
      closeOnEscape: true,
      closeOnBackdrop: false,
      lockScroll: true,
      restoreFocus: true,
    });
  });

  it('preserves every explicit option and public size', () => {
    expect(DIALOG_SIZES).toEqual(['sm', 'md', 'lg']);
    expect(DIALOG_DISMISS_REASONS).toEqual([
      'escape',
      'backdrop',
      'close-button',
      'native-close',
    ]);
    expect(
      resolveDialogOptions({
        ids: { titleId: 'title', descriptionId: 'description' },
        open: true,
        size: 'lg',
        closeOnEscape: false,
        closeOnBackdrop: true,
        lockScroll: false,
        restoreFocus: false,
      }),
    ).toEqual({
      ids: { titleId: 'title', descriptionId: 'description' },
      open: true,
      size: 'lg',
      closeOnEscape: false,
      closeOnBackdrop: true,
      lockScroll: false,
      restoreFocus: false,
    });
  });

  it('requires explicit, unique, whitespace-free IDs', () => {
    expect(() => resolveDialogOptions({ ids: { titleId: '' } })).toThrow(
      /non-empty explicit ID/,
    );
    expect(() => resolveDialogOptions({ ids: { titleId: 'dialog title' } })).toThrow(
      /ASCII whitespace/,
    );
    expect(() =>
      resolveDialogOptions({
        ids: { titleId: 'same', descriptionId: 'same' },
      }),
    ).toThrow(/unique/);
  });
});
