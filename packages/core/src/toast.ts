export const TOAST_TONES = ['neutral', 'info', 'success', 'warning', 'danger'] as const;
export const TOAST_DISMISS_REASONS = ['timeout', 'close-button'] as const;

export type ToastTone = (typeof TOAST_TONES)[number];
export type ToastDismissReason = (typeof TOAST_DISMISS_REASONS)[number];
export type ToastLive = 'polite' | 'assertive';
export type ToastRole = 'status' | 'alert';

export interface ToastOptions {
  readonly open?: boolean;
  readonly tone?: ToastTone;
  readonly duration?: number | null;
}

export interface ResolvedToastOptions {
  readonly open: boolean;
  readonly tone: ToastTone;
  readonly duration: number | null;
  readonly live: ToastLive;
  readonly role: ToastRole;
}

export function resolveToastOptions(options: ToastOptions = {}): ResolvedToastOptions {
  const tone = options.tone ?? 'neutral';
  const duration = options.duration === undefined ? 5000 : options.duration;

  if (duration !== null && (!Number.isFinite(duration) || duration <= 0)) {
    throw new TypeError('Toast duration must be a positive finite number or null.');
  }

  const urgent = tone === 'warning' || tone === 'danger';
  return {
    open: options.open ?? true,
    tone,
    duration,
    live: urgent ? 'assertive' : 'polite',
    role: urgent ? 'alert' : 'status',
  };
}
