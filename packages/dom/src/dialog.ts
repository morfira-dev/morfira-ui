import {
  resolveDialogOptions,
  type DialogDismissReason,
  type DialogOptions,
  type ResolvedDialogOptions,
} from '@morfira-dev/core/dialog';

const MANAGED_ATTRIBUTES: readonly string[] = [
  'aria-describedby',
  'aria-labelledby',
  'aria-modal',
  'data-morfira-dialog',
  'data-size',
  'data-state',
  'tabindex',
];

const INITIAL_FOCUS_SELECTORS: readonly string[] = [
  '[data-morfira-dialog-initial-focus]',
  '[autofocus]',
];

const TABBABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type AttributeSnapshot = ReadonlyMap<string, string | null>;
type CloseRequestReason = Exclude<DialogDismissReason, 'native-close'>;

interface ScrollLockRecord {
  count: number;
  readonly overflow: string;
}

const scrollLocks = new WeakMap<Document, ScrollLockRecord>();

export type DialogFocusTarget = HTMLElement | (() => HTMLElement | null);

export interface DialogDomOptions extends DialogOptions {
  readonly initialFocus?: DialogFocusTarget;
  readonly returnFocus?: DialogFocusTarget;
  readonly onDismiss?: (reason: DialogDismissReason) => void;
}

export interface DialogController {
  readonly state: ResolvedDialogOptions;
  update(options: DialogDomOptions): void;
  requestClose(reason: CloseRequestReason): void;
  destroy(): void;
}

function captureAttributes(dialog: HTMLDialogElement): AttributeSnapshot {
  return new Map(
    MANAGED_ATTRIBUTES.map((name): readonly [string, string | null] => [
      name,
      dialog.getAttribute(name),
    ]),
  );
}

function restoreAttributes(
  dialog: HTMLDialogElement,
  snapshot: AttributeSnapshot,
): void {
  for (const [name, value] of snapshot) {
    if (value === null) {
      dialog.removeAttribute(name);
    } else {
      dialog.setAttribute(name, value);
    }
  }
}

function setOptionalAttribute(
  dialog: HTMLDialogElement,
  name: string,
  value: string | undefined,
): void {
  if (value === undefined) {
    dialog.removeAttribute(name);
  } else {
    dialog.setAttribute(name, value);
  }
}

function applyDialogState(
  dialog: HTMLDialogElement,
  state: ResolvedDialogOptions,
): void {
  dialog.setAttribute('data-morfira-dialog', '');
  dialog.setAttribute('data-size', state.size);
  dialog.setAttribute('data-state', state.open ? 'open' : 'closed');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', state.ids.titleId);
  setOptionalAttribute(dialog, 'aria-describedby', state.ids.descriptionId);
  dialog.setAttribute('tabindex', '-1');
}

function acquireScrollLock(document: Document): void {
  const record = scrollLocks.get(document);

  if (record !== undefined) {
    record.count += 1;
    return;
  }

  scrollLocks.set(document, {
    count: 1,
    overflow: document.documentElement.style.overflow,
  });
  document.documentElement.style.overflow = 'hidden';
}

function releaseScrollLock(document: Document): void {
  const record = scrollLocks.get(document);

  if (record === undefined) {
    return;
  }

  record.count -= 1;
  if (record.count > 0) {
    return;
  }

  document.documentElement.style.overflow = record.overflow;
  scrollLocks.delete(document);
}

function resolveFocusTarget(target: DialogFocusTarget | undefined): HTMLElement | null {
  if (target === undefined) {
    return null;
  }

  return typeof target === 'function' ? target() : target;
}

function isAvailableFocusTarget(
  target: HTMLElement,
  document: Document,
  container?: HTMLDialogElement,
): boolean {
  if (
    !target.isConnected ||
    target.ownerDocument !== document ||
    (container !== undefined && !container.contains(target)) ||
    target.matches(':disabled,[hidden]') ||
    target.closest('[inert]') !== null
  ) {
    return false;
  }

  return true;
}

function firstAvailableMatch(
  dialog: HTMLDialogElement,
  selector: string,
): HTMLElement | null {
  for (const candidate of dialog.querySelectorAll<HTMLElement>(selector)) {
    if (isAvailableFocusTarget(candidate, dialog.ownerDocument, dialog)) {
      return candidate;
    }
  }

  return null;
}

function focusInitialTarget(
  dialog: HTMLDialogElement,
  target: DialogFocusTarget | undefined,
): void {
  const explicitTarget = resolveFocusTarget(target);
  if (
    explicitTarget !== null &&
    isAvailableFocusTarget(explicitTarget, dialog.ownerDocument, dialog)
  ) {
    explicitTarget.focus({ preventScroll: true });
    return;
  }

  for (const selector of INITIAL_FOCUS_SELECTORS) {
    const matchedTarget = firstAvailableMatch(dialog, selector);
    if (matchedTarget !== null) {
      matchedTarget.focus({ preventScroll: true });
      return;
    }
  }

  const tabbableTarget = firstAvailableMatch(dialog, TABBABLE_SELECTOR);
  if (tabbableTarget !== null) {
    tabbableTarget.focus({ preventScroll: true });
    return;
  }

  dialog.focus({ preventScroll: true });
}

function restoreFocus(
  document: Document,
  configuredTarget: DialogFocusTarget | undefined,
  opener: HTMLElement | null,
): void {
  const target = resolveFocusTarget(configuredTarget) ?? opener;
  if (target !== null && isAvailableFocusTarget(target, document)) {
    target.focus({ preventScroll: true });
  }
}

/**
 * Enhances a closed native dialog as a controlled modal layer. User dismissal emits a
 * request; the owner closes the layer by updating `open` to false.
 */
export function enhanceDialog(
  dialog: HTMLDialogElement,
  initialOptions: DialogDomOptions,
): DialogController {
  if (dialog.open) {
    throw new TypeError('Dialog must be closed before it can be enhanced.');
  }

  const snapshot = captureAttributes(dialog);
  const document = dialog.ownerDocument;
  let options = initialOptions;
  let state = resolveDialogOptions(initialOptions);
  let destroyed = false;
  let lifecycleOpen = false;
  let scrollLocked = false;
  let opener: HTMLElement | null = null;
  let backdropPointerDown = false;

  const lockScroll = (): void => {
    if (!scrollLocked) {
      acquireScrollLock(document);
      scrollLocked = true;
    }
  };

  const unlockScroll = (): void => {
    if (scrollLocked) {
      releaseScrollLock(document);
      scrollLocked = false;
    }
  };

  const finishOpenLifecycle = (): void => {
    if (!lifecycleOpen) {
      return;
    }

    lifecycleOpen = false;
    unlockScroll();

    if (state.restoreFocus) {
      restoreFocus(document, options.returnFocus, opener);
    }

    opener = null;
  };

  const openDialog = (): void => {
    opener = document.activeElement as HTMLElement | null;

    if (state.lockScroll) {
      lockScroll();
    }

    try {
      dialog.showModal();
    } catch (error: unknown) {
      unlockScroll();
      opener = null;
      throw error;
    }

    lifecycleOpen = true;
    focusInitialTarget(dialog, options.initialFocus);
  };

  const closeDialog = (): void => {
    if (dialog.open) {
      dialog.close();
    }
    finishOpenLifecycle();
  };

  const onCancel = (event: Event): void => {
    event.preventDefault();
    backdropPointerDown = false;

    if (state.open && state.closeOnEscape) {
      options.onDismiss?.('escape');
    }
  };

  const onPointerDown = (event: PointerEvent): void => {
    backdropPointerDown =
      state.open &&
      state.closeOnBackdrop &&
      event.target === dialog &&
      event.button === 0 &&
      event.isPrimary;
  };

  const onPointerUp = (event: PointerEvent): void => {
    const shouldDismiss =
      backdropPointerDown &&
      state.open &&
      state.closeOnBackdrop &&
      event.target === dialog &&
      event.button === 0 &&
      event.isPrimary;

    backdropPointerDown = false;
    if (shouldDismiss) {
      options.onDismiss?.('backdrop');
    }
  };

  const onNativeClose = (): void => {
    if (destroyed || !state.open) {
      return;
    }

    state = { ...state, open: false };
    applyDialogState(dialog, state);
    finishOpenLifecycle();
    options.onDismiss?.('native-close');
  };

  dialog.addEventListener('cancel', onCancel);
  dialog.addEventListener('pointerdown', onPointerDown);
  dialog.addEventListener('pointerup', onPointerUp);
  dialog.addEventListener('close', onNativeClose);
  applyDialogState(dialog, state);

  if (state.open) {
    openDialog();
  }

  return {
    get state(): ResolvedDialogOptions {
      return state;
    },
    update(nextOptions: DialogDomOptions): void {
      if (destroyed) {
        return;
      }

      const wasOpen = state.open;
      const wasLockingScroll = state.lockScroll;
      options = nextOptions;
      state = resolveDialogOptions(nextOptions);
      applyDialogState(dialog, state);

      if (!wasOpen && state.open) {
        openDialog();
        return;
      }

      if (wasOpen && !state.open) {
        closeDialog();
        return;
      }

      if (state.open && wasLockingScroll !== state.lockScroll) {
        if (state.lockScroll) {
          lockScroll();
        } else {
          unlockScroll();
        }
      }
    },
    requestClose(reason: CloseRequestReason): void {
      if (!destroyed && state.open) {
        options.onDismiss?.(reason);
      }
    },
    destroy(): void {
      if (destroyed) {
        return;
      }

      destroyed = true;
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
      dialog.removeEventListener('close', onNativeClose);

      if (dialog.open) {
        dialog.close();
      }
      finishOpenLifecycle();
      restoreAttributes(dialog, snapshot);
    },
  };
}
