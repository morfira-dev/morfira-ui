import {
  resolveDropdownOptions,
  type DropdownOptions,
  type ResolvedDropdownOptions,
} from '@morfira-dev/core/dropdown';
import type { MenuController } from './menu.js';

type Snapshot = ReadonlyMap<string, string | null>;
const capture = (element: HTMLElement, names: readonly string[]): Snapshot =>
  new Map(names.map((name) => [name, element.getAttribute(name)] as const));
const restore = (element: HTMLElement, snapshot: Snapshot): void => {
  for (const [name, value] of snapshot) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }
};

export type DropdownOpenReason =
  | 'trigger'
  | 'arrow-first'
  | 'arrow-last'
  | 'escape'
  | 'outside-pointer'
  | 'tab'
  | 'select';

export interface DropdownDomOptions extends DropdownOptions {
  readonly onOpenChange?: (open: boolean, reason: DropdownOpenReason) => void;
}

export interface DropdownController {
  readonly state: ResolvedDropdownOptions;
  update(options: DropdownDomOptions): void;
  destroy(): void;
}

export function enhanceDropdown(
  trigger: HTMLElement,
  content: HTMLElement,
  menu: MenuController,
  initialOptions: DropdownDomOptions,
): DropdownController {
  const triggerSnapshot = capture(trigger, [
    'aria-controls',
    'aria-expanded',
    'aria-haspopup',
    'data-morfira-dropdown-trigger',
    'data-state',
  ]);
  const contentSnapshot = capture(content, [
    'id',
    'hidden',
    'style',
    'data-morfira-dropdown',
    'data-placement',
    'data-state',
    'data-direction',
  ]);
  const document = trigger.ownerDocument;
  let options = initialOptions;
  let state = resolveDropdownOptions(options);
  let destroyed = false;
  let pendingFocus: 'first' | 'last' | undefined;

  const request = (open: boolean, reason: DropdownOpenReason): void => {
    if (!destroyed && !state.disabled && open !== state.open) {
      options.onOpenChange?.(open, reason);
    }
  };
  const position = (): void => {
    if (!state.open) return;
    const rect = trigger.getBoundingClientRect();
    const view = document.defaultView;
    const rtl = view?.getComputedStyle(trigger).direction === 'rtl';
    content.setAttribute('data-direction', rtl ? 'rtl' : 'ltr');
    const physicalX =
      state.placement === 'block-start' || state.placement === 'block-end'
        ? rtl
          ? rect.right
          : rect.left
        : state.placement === 'inline-start'
          ? rtl
            ? rect.right
            : rect.left
          : rtl
            ? rect.left
            : rect.right;
    const x = rtl ? view.innerWidth - physicalX : physicalX;
    const y =
      state.placement === 'inline-start' || state.placement === 'inline-end'
        ? rect.top
        : state.placement === 'block-start'
          ? rect.top
          : rect.bottom;
    content.style.setProperty('--morfira-dropdown-anchor-x', `${String(x)}px`);
    content.style.setProperty('--morfira-dropdown-anchor-y', `${String(y)}px`);
  };
  const apply = (): void => {
    trigger.setAttribute('aria-controls', state.contentId);
    trigger.setAttribute('aria-expanded', String(state.open));
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('data-morfira-dropdown-trigger', '');
    trigger.setAttribute('data-state', state.open ? 'open' : 'closed');
    content.id = state.contentId;
    content.hidden = !state.open;
    content.setAttribute('data-morfira-dropdown', '');
    content.setAttribute('data-placement', state.placement);
    content.setAttribute('data-state', state.open ? 'open' : 'closed');
    position();
    if (state.open && pendingFocus !== undefined) {
      const target = pendingFocus;
      pendingFocus = undefined;
      menu.focus(target);
    }
  };
  const onTriggerClick = (): void => {
    request(!state.open, 'trigger');
  };
  const onTriggerKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    pendingFocus = event.key === 'ArrowDown' ? 'first' : 'last';
    if (state.open) {
      menu.focus(pendingFocus);
      pendingFocus = undefined;
    } else request(true, event.key === 'ArrowDown' ? 'arrow-first' : 'arrow-last');
  };
  const onDocumentKeyDown = (event: KeyboardEvent): void => {
    if (
      !event.defaultPrevented &&
      event.key === 'Escape' &&
      state.open &&
      state.closeOnEscape
    ) {
      event.preventDefault();
      request(false, 'escape');
    }
  };
  const onPointerDown = (event: PointerEvent): void => {
    const target = event.target as Node | null;
    if (
      state.open &&
      state.closeOnOutsidePointer &&
      event.button === 0 &&
      event.isPrimary &&
      target !== null &&
      !trigger.contains(target) &&
      !content.contains(target)
    ) {
      request(false, 'outside-pointer');
    }
  };
  trigger.addEventListener('click', onTriggerClick);
  trigger.addEventListener('keydown', onTriggerKeyDown);
  document.addEventListener('keydown', onDocumentKeyDown);
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
      state = resolveDropdownOptions(next);
      apply();
      if (wasOpen && !state.open && state.restoreFocus && trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      trigger.removeEventListener('click', onTriggerClick);
      trigger.removeEventListener('keydown', onTriggerKeyDown);
      document.removeEventListener('keydown', onDocumentKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      document.defaultView?.removeEventListener('resize', position);
      document.defaultView?.removeEventListener('scroll', position, true);
      restore(trigger, triggerSnapshot);
      restore(content, contentSnapshot);
    },
  };
}
