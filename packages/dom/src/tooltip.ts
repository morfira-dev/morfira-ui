import {
  resolveTooltipOptions,
  type ResolvedTooltipOptions,
  type TooltipOptions,
} from '@morfira-dev/core/tooltip';

const TRIGGER_ATTRIBUTES = [
  'aria-describedby',
  'data-morfira-tooltip-trigger',
  'data-state',
] as const;
const CONTENT_ATTRIBUTES = [
  'id',
  'role',
  'hidden',
  'style',
  'data-morfira-tooltip',
  'data-placement',
  'data-state',
  'data-direction',
] as const;
type Snapshot = ReadonlyMap<string, string | null>;

export interface TooltipDomOptions extends TooltipOptions {
  readonly onOpenChange?: (
    open: boolean,
    reason: 'pointer' | 'focus' | 'escape',
  ) => void;
}
export interface TooltipController {
  readonly state: ResolvedTooltipOptions;
  update(options: TooltipDomOptions): void;
  destroy(): void;
}

const capture = (element: HTMLElement, names: readonly string[]): Snapshot =>
  new Map(names.map((name) => [name, element.getAttribute(name)] as const));
const restore = (element: HTMLElement, snapshot: Snapshot): void => {
  for (const [name, value] of snapshot) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }
};

export function enhanceTooltip(
  trigger: HTMLElement,
  content: HTMLElement,
  initialOptions: TooltipDomOptions,
): TooltipController {
  const triggerSnapshot = capture(trigger, TRIGGER_ATTRIBUTES);
  const contentSnapshot = capture(content, CONTENT_ATTRIBUTES);
  const existingDescription: string | null =
    triggerSnapshot.get('aria-describedby') ?? null;
  let options = initialOptions;
  let state = resolveTooltipOptions(options);
  let destroyed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const position = (): void => {
    if (!state.open) return;
    const rect = trigger.getBoundingClientRect();
    const view = trigger.ownerDocument.defaultView;
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
    content.style.setProperty('--morfira-tooltip-anchor-x', `${String(x)}px`);
    content.style.setProperty('--morfira-tooltip-anchor-y', `${String(y)}px`);
  };

  const apply = (): void => {
    trigger.setAttribute('data-morfira-tooltip-trigger', '');
    trigger.setAttribute('data-state', state.open ? 'open' : 'closed');
    if (state.open) {
      const descriptions = new Set(existingDescription?.split(/\s+/u) ?? []);
      descriptions.add(state.contentId);
      trigger.setAttribute('aria-describedby', [...descriptions].join(' '));
    } else if (existingDescription === null) {
      trigger.removeAttribute('aria-describedby');
    } else {
      trigger.setAttribute('aria-describedby', existingDescription);
    }
    content.id = state.contentId;
    content.setAttribute('role', 'tooltip');
    content.setAttribute('data-morfira-tooltip', '');
    content.setAttribute('data-placement', state.placement);
    content.setAttribute('data-state', state.open ? 'open' : 'closed');
    content.hidden = !state.open;
    position();
  };
  const request = (
    open: boolean,
    reason: 'pointer' | 'focus' | 'escape',
    delay: number,
  ): void => {
    if (timer !== undefined) clearTimeout(timer);
    if (destroyed || state.disabled || open === state.open) return;
    timer = setTimeout(() => {
      timer = undefined;
      options.onOpenChange?.(open, reason);
    }, delay);
  };
  const onPointerEnter = (): void => {
    request(true, 'pointer', state.openDelay);
  };
  const onPointerLeave = (): void => {
    request(false, 'pointer', state.closeDelay);
  };
  const onFocus = (): void => {
    request(true, 'focus', 0);
  };
  const onBlur = (): void => {
    request(false, 'focus', state.closeDelay);
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && state.open) {
      event.preventDefault();
      request(false, 'escape', 0);
    }
  };

  for (const element of [trigger, content]) {
    element.addEventListener('pointerenter', onPointerEnter);
    element.addEventListener('pointerleave', onPointerLeave);
  }
  trigger.addEventListener('focus', onFocus);
  trigger.addEventListener('blur', onBlur);
  trigger.ownerDocument.addEventListener('keydown', onKeyDown);
  trigger.ownerDocument.defaultView?.addEventListener('resize', position);
  trigger.ownerDocument.defaultView?.addEventListener('scroll', position, true);
  apply();

  return {
    get state() {
      return state;
    },
    update(next) {
      if (!destroyed) {
        if (timer !== undefined) {
          clearTimeout(timer);
          timer = undefined;
        }
        options = next;
        state = resolveTooltipOptions(next);
        apply();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (timer !== undefined) clearTimeout(timer);
      for (const element of [trigger, content]) {
        element.removeEventListener('pointerenter', onPointerEnter);
        element.removeEventListener('pointerleave', onPointerLeave);
      }
      trigger.removeEventListener('focus', onFocus);
      trigger.removeEventListener('blur', onBlur);
      trigger.ownerDocument.removeEventListener('keydown', onKeyDown);
      trigger.ownerDocument.defaultView?.removeEventListener('resize', position);
      trigger.ownerDocument.defaultView?.removeEventListener('scroll', position, true);
      restore(trigger, triggerSnapshot);
      restore(content, contentSnapshot);
    },
  };
}
