import {
  resolveDrawerOptions,
  type DrawerDismissReason,
  type DrawerOptions,
  type ResolvedDrawerOptions,
} from '@morfira-dev/core/drawer';

import {
  acquireDocumentScrollLock,
  releaseDocumentScrollLock,
} from './internal/scroll-lock.js';

const MANAGED_ATTRIBUTES = [
  'aria-describedby',
  'aria-labelledby',
  'aria-modal',
  'data-modal',
  'data-morfira-drawer',
  'data-side',
  'data-size',
  'data-state',
  'open',
  'role',
  'tabindex',
] as const;
const INITIAL_FOCUS_SELECTORS = [
  '[data-morfira-drawer-initial-focus]',
  '[autofocus]',
] as const;
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
type CloseRequestReason = Exclude<DrawerDismissReason, 'native-close'>;

const openDrawerStacks = new WeakMap<Document, object[]>();

function drawerStack(document: Document): object[] {
  const existing = openDrawerStacks.get(document);
  if (existing !== undefined) return existing;
  const created: object[] = [];
  openDrawerStacks.set(document, created);
  return created;
}

export type DrawerFocusTarget = HTMLElement | (() => HTMLElement | null);

export interface DrawerDomOptions extends DrawerOptions {
  readonly initialFocus?: DrawerFocusTarget;
  readonly returnFocus?: DrawerFocusTarget;
  readonly onDismiss?: (reason: DrawerDismissReason) => void;
}

export interface DrawerController {
  readonly state: ResolvedDrawerOptions;
  update(options: DrawerDomOptions): void;
  requestClose(reason: CloseRequestReason): void;
  destroy(): void;
}

function resolveFocusTarget(target: DrawerFocusTarget | undefined): HTMLElement | null {
  return typeof target === 'function' ? target() : (target ?? null);
}

function isAvailable(
  target: HTMLElement,
  document: Document,
  container?: HTMLDialogElement,
): boolean {
  return (
    target.isConnected &&
    target.ownerDocument === document &&
    (container === undefined || container.contains(target)) &&
    !target.matches(':disabled,[hidden]') &&
    target.closest('[inert]') === null
  );
}

function focusInitial(
  drawer: HTMLDialogElement,
  target: DrawerFocusTarget | undefined,
): void {
  const explicit = resolveFocusTarget(target);
  if (explicit !== null && isAvailable(explicit, drawer.ownerDocument, drawer)) {
    explicit.focus({ preventScroll: true });
    return;
  }
  for (const selector of INITIAL_FOCUS_SELECTORS) {
    const match = [...drawer.querySelectorAll<HTMLElement>(selector)].find(
      (candidate) => isAvailable(candidate, drawer.ownerDocument, drawer),
    );
    if (match !== undefined) {
      match.focus({ preventScroll: true });
      return;
    }
  }
  const tabbable = [...drawer.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)].find(
    (candidate) => isAvailable(candidate, drawer.ownerDocument, drawer),
  );
  (tabbable ?? drawer).focus({ preventScroll: true });
}

function setOptional(
  element: HTMLElement,
  name: string,
  value: string | undefined,
): void {
  if (value === undefined) element.removeAttribute(name);
  else element.setAttribute(name, value);
}

export function enhanceDrawer(
  drawer: HTMLDialogElement,
  initialOptions: DrawerDomOptions,
): DrawerController {
  if (drawer.open) {
    throw new TypeError('Drawer must be closed before it can be enhanced.');
  }
  const snapshot: AttributeSnapshot = new Map(
    MANAGED_ATTRIBUTES.map((name) => [name, drawer.getAttribute(name)] as const),
  );
  const document = drawer.ownerDocument;
  let options = initialOptions;
  let state = resolveDrawerOptions(options);
  let destroyed = false;
  let lifecycleOpen = false;
  let renderedModal: boolean | undefined;
  let scrollLocked = false;
  let opener: HTMLElement | null = null;
  let backdropPointerDown = false;
  let expectedCloses = 0;
  const stackToken = {};

  const removeFromStack = (): void => {
    const stack = drawerStack(document);
    const index = stack.lastIndexOf(stackToken);
    if (index >= 0) stack.splice(index, 1);
  };
  const ownsTopLayer = (): boolean => drawerStack(document).at(-1) === stackToken;

  const applyAttributes = (): void => {
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('data-morfira-drawer', '');
    drawer.setAttribute('data-state', state.open ? 'open' : 'closed');
    drawer.setAttribute('data-modal', String(state.modal));
    drawer.setAttribute('data-side', state.side);
    drawer.setAttribute('data-size', state.size);
    drawer.setAttribute('aria-labelledby', state.ids.titleId);
    setOptional(drawer, 'aria-describedby', state.ids.descriptionId);
    setOptional(drawer, 'aria-modal', state.modal ? 'true' : undefined);
    drawer.setAttribute('tabindex', '-1');
  };
  const lock = (): void => {
    if (!scrollLocked && state.modal && state.lockScroll) {
      acquireDocumentScrollLock(document);
      scrollLocked = true;
    }
  };
  const unlock = (): void => {
    if (!scrollLocked) return;
    releaseDocumentScrollLock(document);
    scrollLocked = false;
  };
  const closeNative = (): void => {
    if (!drawer.open) return;
    expectedCloses += 1;
    drawer.close();
  };
  const restore = (): void => {
    const target = resolveFocusTarget(options.returnFocus) ?? opener;
    if (state.restoreFocus && target !== null && isAvailable(target, document)) {
      target.focus({ preventScroll: true });
    }
  };
  const finishLifecycle = (): void => {
    if (!lifecycleOpen) return;
    lifecycleOpen = false;
    removeFromStack();
    unlock();
    restore();
    opener = null;
    renderedModal = undefined;
  };
  const openNative = (captureOpener: boolean): void => {
    if (captureOpener) opener = document.activeElement as HTMLElement | null;
    lock();
    try {
      if (state.modal) drawer.showModal();
      else drawer.show();
    } catch (error: unknown) {
      unlock();
      if (captureOpener) opener = null;
      throw error;
    }
    lifecycleOpen = true;
    if (!drawerStack(document).includes(stackToken)) {
      drawerStack(document).push(stackToken);
    }
    renderedModal = state.modal;
    focusInitial(drawer, options.initialFocus);
  };
  const synchronizeNative = (): void => {
    if (!state.open) {
      closeNative();
      finishLifecycle();
      return;
    }
    if (!drawer.open) {
      openNative(!lifecycleOpen);
      return;
    }
    if (renderedModal !== state.modal) {
      unlock();
      closeNative();
      openNative(false);
      return;
    }
    if (state.modal && state.lockScroll) lock();
    else unlock();
  };
  const request = (reason: CloseRequestReason): void => {
    if (state.open) options.onDismiss?.(reason);
  };
  const onCancel = (event: Event): void => {
    event.preventDefault();
    backdropPointerDown = false;
    if (state.modal && state.open && state.closeOnEscape && ownsTopLayer()) {
      request('escape');
    }
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (
      !state.modal &&
      state.open &&
      state.closeOnEscape &&
      ownsTopLayer() &&
      event.key === 'Escape'
    ) {
      event.preventDefault();
      request('escape');
    }
  };
  const onPointerDown = (event: PointerEvent): void => {
    backdropPointerDown =
      state.modal &&
      state.open &&
      state.closeOnBackdrop &&
      event.target === drawer &&
      event.button === 0 &&
      event.isPrimary;
  };
  const onPointerUp = (event: PointerEvent): void => {
    const shouldDismiss =
      backdropPointerDown &&
      event.target === drawer &&
      event.button === 0 &&
      event.isPrimary;
    backdropPointerDown = false;
    if (shouldDismiss) request('backdrop');
  };
  const onClose = (): void => {
    if (expectedCloses > 0) {
      expectedCloses -= 1;
      return;
    }
    if (!lifecycleOpen) return;
    state = { ...state, open: false };
    applyAttributes();
    finishLifecycle();
    options.onDismiss?.('native-close');
  };

  drawer.addEventListener('cancel', onCancel);
  drawer.addEventListener('close', onClose);
  drawer.addEventListener('pointerdown', onPointerDown);
  drawer.addEventListener('pointerup', onPointerUp);
  document.addEventListener('keydown', onKeyDown);
  applyAttributes();
  synchronizeNative();

  return {
    get state() {
      return state;
    },
    update(nextOptions) {
      if (destroyed) return;
      options = nextOptions;
      state = resolveDrawerOptions(nextOptions);
      applyAttributes();
      synchronizeNative();
    },
    requestClose(reason) {
      if (!destroyed) request(reason);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      drawer.removeEventListener('cancel', onCancel);
      drawer.removeEventListener('close', onClose);
      drawer.removeEventListener('pointerdown', onPointerDown);
      drawer.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('keydown', onKeyDown);
      closeNative();
      lifecycleOpen = false;
      removeFromStack();
      unlock();
      for (const [name, value] of snapshot) {
        if (value === null) drawer.removeAttribute(name);
        else drawer.setAttribute(name, value);
      }
    },
  };
}
