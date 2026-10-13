import { describe, expect, it } from 'vitest';

import {
  DRAWER_DISMISS_REASONS,
  DRAWER_SIDES,
  DRAWER_SIZES,
  resolveDrawerOptions,
} from '../src/drawer.js';

describe('resolveDrawerOptions', () => {
  it('uses conservative modal defaults', () => {
    expect(resolveDrawerOptions({ ids: { titleId: 'drawer-title' } })).toEqual({
      ids: { titleId: 'drawer-title' },
      open: false,
      modal: true,
      side: 'inline-end',
      size: 'md',
      closeOnEscape: true,
      closeOnBackdrop: false,
      lockScroll: true,
      restoreFocus: true,
    });
  });

  it('preserves the explicit public contract', () => {
    expect(
      resolveDrawerOptions({
        ids: { titleId: 'title', descriptionId: 'description' },
        open: true,
        modal: false,
        side: 'inline-start',
        size: 'lg',
        closeOnEscape: false,
        closeOnBackdrop: true,
        lockScroll: false,
        restoreFocus: false,
      }),
    ).toMatchObject({
      open: true,
      modal: false,
      side: 'inline-start',
      size: 'lg',
      closeOnEscape: false,
      closeOnBackdrop: true,
      lockScroll: false,
      restoreFocus: false,
    });
    expect(DRAWER_SIDES).toEqual(['inline-start', 'inline-end']);
    expect(DRAWER_SIZES).toEqual(['sm', 'md', 'lg']);
    expect(DRAWER_DISMISS_REASONS).toContain('native-close');
  });

  it('requires unique whitespace-free IDs', () => {
    expect(() => resolveDrawerOptions({ ids: { titleId: '' } })).toThrow(
      /non-empty ID/,
    );
    expect(() => resolveDrawerOptions({ ids: { titleId: 'drawer title' } })).toThrow(
      /ASCII whitespace/,
    );
    expect(() =>
      resolveDrawerOptions({
        ids: { titleId: 'same', descriptionId: 'same' },
      }),
    ).toThrow(/unique/);
  });
});
