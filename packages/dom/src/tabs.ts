import {
  resolveTabsOptions,
  type ResolvedTabsOptions,
  type TabsOptions,
} from '@morfira-dev/core/tabs';

type Snapshot = ReadonlyMap<string, string | null>;
const NAMES = [
  'id',
  'role',
  'tabindex',
  'hidden',
  'aria-controls',
  'aria-labelledby',
  'aria-selected',
  'aria-disabled',
  'data-morfira-tabs',
  'data-morfira-tab',
  'data-morfira-tab-panel',
  'data-orientation',
  'aria-orientation',
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

export interface TabsElements {
  readonly root: HTMLElement;
  readonly tabs: readonly HTMLElement[];
  readonly panels: readonly HTMLElement[];
}
export interface TabsDomOptions extends TabsOptions {
  readonly onSelectedChange?: (tabId: string) => void;
}
export interface TabsController {
  readonly state: ResolvedTabsOptions;
  update(options: TabsDomOptions): void;
  destroy(): void;
}

export function enhanceTabs(
  elements: TabsElements,
  initialOptions: TabsDomOptions,
): TabsController {
  const all = [elements.root, ...elements.tabs, ...elements.panels];
  const snapshots = all.map((element) => capture(element));
  let options = initialOptions;
  let state = resolveTabsOptions(options);
  let destroyed = false;
  let focusedId = state.selectedId;

  const assertShape = (): void => {
    if (
      elements.tabs.length !== state.items.length ||
      elements.panels.length !== state.items.length
    )
      throw new TypeError('Tabs requires one tab and panel element per item.');
  };
  const apply = (): void => {
    assertShape();
    elements.root.setAttribute('role', 'tablist');
    elements.root.setAttribute('data-morfira-tabs', '');
    elements.root.setAttribute('data-orientation', state.orientation);
    elements.root.setAttribute('aria-orientation', state.orientation);
    state.items.forEach((item, index) => {
      const tab = elements.tabs[index];
      const panel = elements.panels[index];
      if (tab === undefined || panel === undefined) return;
      const selected = item.tabId === state.selectedId;
      tab.id = item.tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('data-morfira-tab', '');
      tab.setAttribute('aria-controls', item.panelId);
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('data-state', selected ? 'active' : 'inactive');
      tab.tabIndex = item.disabled
        ? -1
        : item.tabId === (focusedId ?? state.selectedId)
          ? 0
          : -1;
      if (item.disabled) tab.setAttribute('aria-disabled', 'true');
      else tab.removeAttribute('aria-disabled');
      panel.id = item.panelId;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('data-morfira-tab-panel', '');
      panel.setAttribute('aria-labelledby', item.tabId);
      panel.setAttribute('data-state', selected ? 'active' : 'inactive');
      panel.hidden = !selected;
      if (selected) panel.tabIndex = 0;
      else panel.removeAttribute('tabindex');
    });
  };
  const request = (id: string): void => {
    if (id !== state.selectedId) options.onSelectedChange?.(id);
  };
  const move = (index: number, direction: -1 | 1): number => {
    let next = index;
    for (let step = 0; step < state.items.length; step += 1) {
      next += direction;
      if (state.loop) next = (next + state.items.length) % state.items.length;
      else if (next < 0 || next >= state.items.length) return index;
      if (state.items[next]?.disabled === false) return next;
    }
    return index;
  };
  const lastEnabledIndex = (): number => {
    for (let index = state.items.length - 1; index >= 0; index -= 1) {
      if (state.items[index]?.disabled === false) return index;
    }
    return -1;
  };
  const listeners = elements.tabs.map((tab, index) => {
    const onClick = (): void => {
      const item = state.items[index];
      if (item && !item.disabled) request(item.tabId);
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      const closestDirection =
        typeof elements.root.closest === 'function'
          ? elements.root.closest<HTMLElement>('[dir]')?.dir
          : undefined;
      const rtl = (elements.root.dir || closestDirection) === 'rtl';
      const previousKey =
        state.orientation === 'horizontal'
          ? rtl
            ? 'ArrowRight'
            : 'ArrowLeft'
          : 'ArrowUp';
      const nextKey =
        state.orientation === 'horizontal'
          ? rtl
            ? 'ArrowLeft'
            : 'ArrowRight'
          : 'ArrowDown';
      let target: number;
      if (event.key === previousKey) target = move(index, -1);
      else if (event.key === nextKey) target = move(index, 1);
      else if (event.key === 'Home')
        target = state.items.findIndex((item) => !item.disabled);
      else if (event.key === 'End') target = lastEnabledIndex();
      else if (
        (event.key === 'Enter' || event.key === ' ') &&
        state.activationMode === 'manual'
      ) {
        event.preventDefault();
        const item = state.items[index];
        if (item && !item.disabled) request(item.tabId);
        return;
      } else return;
      event.preventDefault();
      const item = state.items[target];
      if (!item || item.disabled) return;
      focusedId = item.tabId;
      apply();
      elements.tabs[target]?.focus({ preventScroll: true });
      if (state.activationMode === 'automatic') request(item.tabId);
    };
    tab.addEventListener('click', onClick);
    tab.addEventListener('keydown', onKeyDown);
    return { onClick, onKeyDown };
  });
  apply();
  return {
    get state() {
      return state;
    },
    update(next) {
      if (!destroyed) {
        options = next;
        state = resolveTabsOptions(next);
        focusedId = state.selectedId;
        apply();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      listeners.forEach(({ onClick, onKeyDown }, index) => {
        elements.tabs[index]?.removeEventListener('click', onClick);
        elements.tabs[index]?.removeEventListener('keydown', onKeyDown);
      });
      all.forEach((element, index) => {
        const snapshot = snapshots[index];
        if (snapshot !== undefined) restore(element, snapshot);
      });
    },
  };
}
