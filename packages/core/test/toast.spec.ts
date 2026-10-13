import { describe, expect, it } from 'vitest';

import {
  TOAST_DISMISS_REASONS,
  TOAST_TONES,
  resolveToastOptions,
} from '../src/toast.js';

describe('resolveToastOptions', () => {
  it('uses a polite neutral auto-dismiss contract by default', () => {
    expect(resolveToastOptions()).toEqual({
      open: true,
      tone: 'neutral',
      duration: 5000,
      live: 'polite',
      role: 'status',
    });
  });

  it('maps urgent tones to assertive alerts', () => {
    expect(resolveToastOptions({ tone: 'danger', duration: null })).toEqual({
      open: true,
      tone: 'danger',
      duration: null,
      live: 'assertive',
      role: 'alert',
    });
    expect(resolveToastOptions({ tone: 'warning' }).role).toBe('alert');
    expect(resolveToastOptions({ tone: 'success' }).role).toBe('status');
    expect(TOAST_TONES).toEqual(['neutral', 'info', 'success', 'warning', 'danger']);
    expect(TOAST_DISMISS_REASONS).toEqual(['timeout', 'close-button']);
  });

  it('rejects durations that cannot produce a deterministic timer', () => {
    expect(() => resolveToastOptions({ duration: 0 })).toThrow(/positive finite/);
    expect(() => resolveToastOptions({ duration: Number.POSITIVE_INFINITY })).toThrow(
      /positive finite/,
    );
  });
});
