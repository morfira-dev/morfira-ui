import {
  resolvePopoverOptions,
  type PopoverOptions,
  type ResolvedPopoverOptions,
} from '@morfira-dev/core/popover';

type Snapshot = ReadonlyMap<string, string | null>;
const capture = (element: HTMLElement, names: readonly string[]): Snapshot =>
  new Map(names.map((name) => [name, element.getAttribute(name)] as const));
const restore = (element: HTMLElement, snapshot: Snapshot): void => {
  for (const [name, value] of snapshot) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }
};

export type PopoverDismissReason = 'trigger' | 'escape' | 'outside-pointer';
export interface PopoverDomOptions extends PopoverOptions {
  readonly onOpenChange?: (open: boolean, reason: PopoverDismissReason) => void;
}
export interface PopoverController {
  readonly state: ResolvedPopoverOptions;
  update(options: PopoverDomOptions): void;
  destroy(): void;
}

type NativePopoverMethods = {
  readonly showPopover?: () => void;
  readonly hidePopover?: () => void;
};

const openPopoverStack = new WeakMap<Document, object[]>();

function stackFor(document: Document): object[] {
  const existing = openPopoverStack.get(document);
  if (existing !== undefined) return existing;
  const created: object[] = [];
  openPopoverStack.set(document, created);
  return created;
}

export function enhancePopover(
  trigger: HTMLElement,
  content: HTMLElement,
  initialOptions: PopoverDomOptions,
): PopoverController {
  const triggerSnapshot = capture(trigger, [
    'aria-controls',
    'aria-expanded',
    'aria-haspopup',
    'data-morfira-popover-trigger',
    'data-state',
  ]);
  const contentSnapshot = capture(content, [
    'id',
    'popover',
    'hidden',
    'style',
    'data-morfira-popover',
    'data-placement',
    'data-state',
    'data-direction',
  ]);
  const document = trigger.ownerDocument;
  let options = initialOptions;
  let state = resolvePopoverOptions(options);
  let destroyed = false;
  let renderedOpen = false;
  let stacked = false;
  const stackToken = {};

  const syncStack = (): void => {
    const stack = stackFor(document);
    if (state.open && !stacked) {
      stack.push(stackToken);
      stacked = true;
    } else if (!state.open && stacked) {
      const index = stack.lastIndexOf(stackToken);
      if (index >= 0) stack.splice(index, 1);
      stacked = false;
    }
  };

  const ownsTopLayer = (): boolean => {
    const stack = stackFor(document);
    return stack.at(-1) === stackToken;
  };

  const position = (): void => {
    if (!state.open) return;
    const rect = trigger.getBoundingClientRect();
    const view = document.defaultView;
    const rtl = view?.getComputedStyle(trigger).direction === 'rtl';
    content.setAttribute('data-direction', rtl ? 'rtl' : 'ltr');
    const placement = state.placement;
    const physicalX =
      placement === 'block-start' || placement === 'block-end'
        ? rect.left + rect.width / 2
        : placement === 'inline-start'
          ? rtl
            ? rect.right
            : rect.left
          : rtl
            ? rect.left
            : rect.right;
    const x = rtl ? view.innerWidth - physicalX : physicalX;
    const y =
      placement === 'inline-start' || placement === 'inline-end'
        ? rect.top + rect.height / 2
        : placement === 'block-start'
          ? rect.top
          : rect.bottom;
    content.style.setProperty('--morfira-popover-anchor-x', `${String(x)}px`);
    content.style.setProperty('--morfira-popover-anchor-y', `${String(y)}px`);
  };

  const apply = (): void => {
    trigger.setAttribute('aria-controls', state.contentId);
    trigger.setAttribute('aria-expanded', String(state.open));
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('data-morfira-popover-trigger', '');
    trigger.setAttribute('data-state', state.open ? 'open' : 'closed');
    content.id = state.contentId;
    content.setAttribute('popover', 'manual');
    content.setAttribute('data-morfira-popover', '');
    content.setAttribute('data-placement', state.placement);
    content.setAttribute('data-state', state.open ? 'open' : 'closed');
    syncStack();
    const native = content as unknown as NativePopoverMethods;
    if (state.open !== renderedOpen) {
      if (state.open) {
        content.hidden = false;
        native.showPopover?.();
      } else {
        native.hidePopover?.();
        content.hidden = true;
      }
      renderedOpen = state.open;
    } else {
      content.hidden = !state.open;
    }
    position();
  };
  const request = (open: boolean, reason: PopoverDismissReason): void => {
    if (!destroyed && !state.disabled && open !== state.open)
      options.onOpenChange?.(open, reason);
  };
  const onClick = (): void => {
    request(!state.open, 'trigger');
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && state.open && state.closeOnEscape && ownsTopLayer()) {
      event.preventDefault();
      request(false, 'escape');
    }
  };
  const onPointerDown = (event: PointerEvent): void => {
    const target = event.target as Node | null;
    if (
      state.open &&
      ownsTopLayer() &&
      state.closeOnOutsidePointer &&
      event.button === 0 &&
      event.isPrimary &&
      target !== null &&
      !trigger.contains(target) &&
      !content.contains(target)
    )
      request(false, 'outside-pointer');
  };
  trigger.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('pointerdown', onPointerDown);
  document.defaultView?.addEventListener('resize', position);
  document.defaultView?.addEventListener('scroll', position, true);
  apply();

  return {
    get state() {
      return state;
    },
    update(next) {
      if (destroyed) return;
      const wasOpen = state.open;
      options = next;
      state = resolvePopoverOptions(next);
      apply();
      if (wasOpen && !state.open && state.restoreFocus && trigger.isConnected)
        trigger.focus({ preventScroll: true });
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (stacked) {
        const stack = stackFor(document);
        const index = stack.lastIndexOf(stackToken);
        if (index >= 0) stack.splice(index, 1);
        stacked = false;
      }
      if (renderedOpen) (content as unknown as NativePopoverMethods).hidePopover?.();
      trigger.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      document.defaultView?.removeEventListener('resize', position);
      document.defaultView?.removeEventListener('scroll', position, true);
      restore(trigger, triggerSnapshot);
      restore(content, contentSnapshot);
    },
  };
}
