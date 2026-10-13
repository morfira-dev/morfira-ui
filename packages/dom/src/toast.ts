import {
  resolveToastOptions,
  type ResolvedToastOptions,
  type ToastDismissReason,
  type ToastOptions,
} from '@morfira-dev/core/toast';

const MANAGED_ATTRIBUTES = [
  'aria-atomic',
  'aria-live',
  'data-morfira-toast',
  'data-paused',
  'data-state',
  'data-tone',
  'hidden',
  'role',
] as const;

export interface ToastDomOptions extends ToastOptions {
  readonly onDismiss?: (reason: ToastDismissReason) => void;
}

export interface ToastController {
  readonly state: ResolvedToastOptions;
  update(options: ToastDomOptions): void;
  requestDismiss(reason: 'close-button'): void;
  destroy(): void;
}

type AttributeSnapshot = ReadonlyMap<string, string | null>;

function captureAttributes(element: HTMLElement): AttributeSnapshot {
  return new Map(
    MANAGED_ATTRIBUTES.map((name) => [name, element.getAttribute(name)] as const),
  );
}

function restoreAttributes(element: HTMLElement, snapshot: AttributeSnapshot): void {
  for (const [name, value] of snapshot) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }
}

export function enhanceToast(
  element: HTMLElement,
  initialOptions: ToastDomOptions = {},
): ToastController {
  const snapshot = captureAttributes(element);
  const document = element.ownerDocument;
  const view = document.defaultView;
  let options = initialOptions;
  let state = resolveToastOptions(options);
  let destroyed = false;
  let timer: number | undefined;
  let remaining = state.duration;
  let startedAt = 0;
  let timedOut = false;
  const pauseReasons = new Set<'focus' | 'hover' | 'visibility'>();

  const now = (): number => view?.performance.now() ?? Date.now();
  const clearTimer = (): void => {
    if (timer !== undefined) {
      view?.clearTimeout(timer);
      timer = undefined;
    }
  };
  const applyPauseState = (): void => {
    element.setAttribute('data-paused', String(pauseReasons.size > 0));
  };
  const request = (reason: ToastDismissReason): void => {
    if (!destroyed && state.open) options.onDismiss?.(reason);
  };
  const startTimer = (): void => {
    clearTimer();
    if (
      destroyed ||
      !state.open ||
      timedOut ||
      remaining === null ||
      pauseReasons.size > 0 ||
      view === null
    ) {
      return;
    }
    startedAt = now();
    timer = view.setTimeout(() => {
      timer = undefined;
      timedOut = true;
      remaining = 0;
      request('timeout');
    }, remaining);
  };
  const pause = (reason: 'focus' | 'hover' | 'visibility'): void => {
    if (pauseReasons.has(reason)) return;
    if (timer !== undefined && remaining !== null) {
      remaining = Math.max(0, remaining - (now() - startedAt));
    }
    clearTimer();
    pauseReasons.add(reason);
    applyPauseState();
  };
  const resume = (reason: 'focus' | 'hover' | 'visibility'): void => {
    pauseReasons.delete(reason);
    applyPauseState();
    startTimer();
  };
  const apply = (): void => {
    element.setAttribute('data-morfira-toast', '');
    element.setAttribute('data-tone', state.tone);
    element.setAttribute('data-state', state.open ? 'open' : 'closed');
    element.setAttribute('aria-live', state.live);
    element.setAttribute('aria-atomic', 'true');
    element.setAttribute('role', state.role);
    element.hidden = !state.open;
    applyPauseState();
  };

  const onPointerEnter = (): void => {
    pause('hover');
  };
  const onPointerLeave = (): void => {
    resume('hover');
  };
  const onFocusIn = (): void => {
    pause('focus');
  };
  const onFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget;
    if (next === null || !element.contains(next as Node)) resume('focus');
  };
  const onVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') pause('visibility');
    else resume('visibility');
  };

  element.addEventListener('pointerenter', onPointerEnter);
  element.addEventListener('pointerleave', onPointerLeave);
  element.addEventListener('focusin', onFocusIn);
  element.addEventListener('focusout', onFocusOut);
  document.addEventListener('visibilitychange', onVisibilityChange);
  if (document.visibilityState === 'hidden') pauseReasons.add('visibility');
  apply();
  startTimer();

  return {
    get state() {
      return state;
    },
    update(nextOptions) {
      if (destroyed) return;
      const previous = state;
      if (timer !== undefined && remaining !== null) {
        remaining = Math.max(0, remaining - (now() - startedAt));
      }
      clearTimer();
      options = nextOptions;
      state = resolveToastOptions(nextOptions);
      if (previous.open !== state.open || previous.duration !== state.duration) {
        remaining = state.duration;
        timedOut = false;
      }
      apply();
      startTimer();
    },
    requestDismiss(reason) {
      clearTimer();
      request(reason);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearTimer();
      element.removeEventListener('pointerenter', onPointerEnter);
      element.removeEventListener('pointerleave', onPointerLeave);
      element.removeEventListener('focusin', onFocusIn);
      element.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      restoreAttributes(element, snapshot);
    },
  };
}
