import {
  findMenuMatch,
  resolveMenuOptions,
  type MenuOptions,
  type ResolvedMenuOptions,
} from '@morfira-dev/core/menu';

type Snapshot = ReadonlyMap<string, string | null>;
const NAMES = [
  'id',
  'role',
  'tabindex',
  'aria-disabled',
  'data-morfira-menu',
  'data-morfira-menu-item',
  'data-orientation',
  'data-state',
] as const;
const capture = (element: HTMLElement): Snapshot =>
  new Map(NAMES.map((name) => [name, element.getAttribute(name)] as const));
const restore = (element: HTMLElement, snapshot: Snapshot): void => {
  for (const [name, value] of snapshot) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }
};

export type MenuDismissReason = 'escape' | 'tab' | 'select';

export interface MenuDomOptions extends MenuOptions {
  readonly initialFocus?: 'first' | 'last' | 'current';
  readonly onSelect?: (id: string) => void;
  readonly onDismiss?: (reason: MenuDismissReason) => void;
}

export interface MenuController {
  readonly state: ResolvedMenuOptions;
  focus(position?: 'first' | 'last' | 'current'): void;
  update(options: MenuDomOptions): void;
  destroy(): void;
}

export function enhanceMenu(
  root: HTMLElement,
  elements: readonly HTMLElement[],
  initialOptions: MenuDomOptions,
): MenuController {
  const snapshots = [root, ...elements].map(capture);
  let options = initialOptions;
  let state = resolveMenuOptions(options);
  let activeIndex = state.items.findIndex((item) => !item.disabled);
  let query = '';
  let queryTimer: ReturnType<typeof setTimeout> | undefined;
  let destroyed = false;

  const enabled = (): number[] =>
    state.items
      .map((item, index) => (item.disabled ? -1 : index))
      .filter((index) => index >= 0);
  const assertShape = (): void => {
    if (elements.length !== state.items.length) {
      throw new TypeError('Menu requires one element per item.');
    }
  };
  const apply = (): void => {
    assertShape();
    root.setAttribute('role', 'menu');
    root.setAttribute('data-morfira-menu', '');
    root.setAttribute('data-orientation', 'vertical');
    state.items.forEach((item, index) => {
      const element = elements[index];
      if (element === undefined) return;
      element.id = item.id;
      element.setAttribute('role', 'menuitem');
      element.setAttribute('data-morfira-menu-item', '');
      element.setAttribute('data-state', item.disabled ? 'disabled' : 'enabled');
      element.tabIndex = !item.disabled && index === activeIndex ? 0 : -1;
      if (item.disabled) element.setAttribute('aria-disabled', 'true');
      else element.removeAttribute('aria-disabled');
    });
  };
  const focusIndex = (index: number): void => {
    const item = state.items[index];
    if (!item || item.disabled) return;
    activeIndex = index;
    apply();
    elements[index]?.focus({ preventScroll: true });
  };
  const focus = (position: 'first' | 'last' | 'current' = 'current'): void => {
    const indices = enabled();
    if (indices.length === 0) return;
    const index =
      position === 'first'
        ? indices[0]
        : position === 'last'
          ? indices.at(-1)
          : indices.includes(activeIndex)
            ? activeIndex
            : indices[0];
    if (index !== undefined) focusIndex(index);
  };
  const move = (delta: -1 | 1): void => {
    const indices = enabled();
    if (indices.length === 0) return;
    const position = Math.max(0, indices.indexOf(activeIndex));
    let next = position + delta;
    if (state.loop) next = (next + indices.length) % indices.length;
    else next = Math.max(0, Math.min(indices.length - 1, next));
    const index = indices[next];
    if (index !== undefined) focusIndex(index);
  };
  const resetQueryLater = (): void => {
    if (queryTimer !== undefined) clearTimeout(queryTimer);
    queryTimer = setTimeout(() => {
      query = '';
      queryTimer = undefined;
    }, state.typeaheadTimeout);
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focus(event.key === 'Home' ? 'first' : 'last');
    } else if (event.key === 'Escape') {
      event.preventDefault();
      options.onDismiss?.('escape');
    } else if (event.key === 'Tab') {
      options.onDismiss?.('tab');
    } else if (
      event.key.length === 1 &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      const repeated =
        query.length > 0 && Array.from(query).every((value) => value === event.key);
      query = repeated ? event.key : `${query}${event.key}`;
      const match = findMenuMatch(state.items, query, activeIndex);
      if (match >= 0) focusIndex(match);
      resetQueryLater();
    }
  };
  const itemListeners = elements.map((element, index) => {
    const onFocus = (): void => {
      if (!state.items[index]?.disabled) {
        activeIndex = index;
        apply();
      }
    };
    const onClick = (event: MouseEvent): void => {
      const item = state.items[index];
      if (!item || item.disabled) {
        event.preventDefault();
        return;
      }
      options.onSelect?.(item.id);
      options.onDismiss?.('select');
    };
    element.addEventListener('focus', onFocus);
    element.addEventListener('click', onClick);
    return { onFocus, onClick };
  });
  root.addEventListener('keydown', onKeyDown);
  apply();

  return {
    get state() {
      return state;
    },
    focus,
    update(next) {
      if (destroyed) return;
      options = next;
      state = resolveMenuOptions(next);
      if (state.items[activeIndex]?.disabled !== false) {
        activeIndex = state.items.findIndex((item) => !item.disabled);
      }
      apply();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (queryTimer !== undefined) clearTimeout(queryTimer);
      root.removeEventListener('keydown', onKeyDown);
      itemListeners.forEach(({ onFocus, onClick }, index) => {
        elements[index]?.removeEventListener('focus', onFocus);
        elements[index]?.removeEventListener('click', onClick);
      });
      [root, ...elements].forEach((element, index) => {
        const snapshot = snapshots[index];
        if (snapshot !== undefined) restore(element, snapshot);
      });
    },
  };
}
