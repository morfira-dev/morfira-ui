import {
  resolveAccordionOptions,
  type AccordionOptions,
  type ResolvedAccordionOptions,
} from '@morfira-dev/core/accordion';

type Snapshot = ReadonlyMap<string, string | null>;
const NAMES = [
  'id',
  'role',
  'tabindex',
  'open',
  'hidden',
  'aria-controls',
  'aria-disabled',
  'aria-expanded',
  'aria-labelledby',
  'data-morfira-accordion',
  'data-morfira-accordion-item',
  'data-morfira-accordion-trigger',
  'data-morfira-accordion-panel',
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

export interface AccordionElements {
  readonly root: HTMLElement;
  readonly items: readonly HTMLDetailsElement[];
  readonly triggers: readonly HTMLElement[];
  readonly panels: readonly HTMLElement[];
}
export interface AccordionDomOptions extends AccordionOptions {
  readonly onExpandedChange?: (expandedIds: readonly string[]) => void;
}
export interface AccordionController {
  readonly state: ResolvedAccordionOptions;
  update(options: AccordionDomOptions): void;
  destroy(): void;
}

export function enhanceAccordion(
  elements: AccordionElements,
  initialOptions: AccordionDomOptions,
): AccordionController {
  const all = [
    elements.root,
    ...elements.items,
    ...elements.triggers,
    ...elements.panels,
  ];
  const snapshots = all.map((element) => capture(element));
  let options = initialOptions;
  let state = resolveAccordionOptions(options);
  let destroyed = false;
  const assertShape = (): void => {
    if (
      [elements.items.length, elements.triggers.length, elements.panels.length].some(
        (length) => length !== state.items.length,
      )
    )
      throw new TypeError(
        'Accordion requires item, trigger, and panel elements for every item.',
      );
  };
  const apply = (): void => {
    assertShape();
    elements.root.setAttribute('data-morfira-accordion', '');
    state.items.forEach((item, index) => {
      const wrapper = elements.items[index];
      const trigger = elements.triggers[index];
      const panel = elements.panels[index];
      if (wrapper === undefined || trigger === undefined || panel === undefined) return;
      const expanded = state.expandedIds.includes(item.triggerId);
      wrapper.setAttribute('data-morfira-accordion-item', '');
      wrapper.setAttribute('data-state', expanded ? 'open' : 'closed');
      wrapper.open = expanded;
      trigger.id = item.triggerId;
      trigger.setAttribute('data-morfira-accordion-trigger', '');
      trigger.setAttribute('aria-controls', item.panelId);
      trigger.setAttribute('aria-expanded', String(expanded));
      trigger.setAttribute('data-state', expanded ? 'open' : 'closed');
      if (item.disabled) {
        trigger.setAttribute('aria-disabled', 'true');
        trigger.tabIndex = -1;
      } else {
        trigger.removeAttribute('aria-disabled');
        trigger.removeAttribute('tabindex');
      }
      panel.id = item.panelId;
      panel.setAttribute('role', 'region');
      panel.setAttribute('data-morfira-accordion-panel', '');
      panel.setAttribute('aria-labelledby', item.triggerId);
      panel.setAttribute('data-state', expanded ? 'open' : 'closed');
      panel.hidden = !expanded;
    });
  };
  const toggle = (index: number): void => {
    const item = state.items[index];
    if (!item || item.disabled) return;
    const expanded = state.expandedIds.includes(item.triggerId);
    if (expanded && !state.collapsible && state.expandedIds.length === 1) return;
    const next = expanded
      ? state.expandedIds.filter((id) => id !== item.triggerId)
      : state.multiple
        ? [...state.expandedIds, item.triggerId]
        : [item.triggerId];
    options.onExpandedChange?.(next);
  };
  const focusAt = (index: number): void => {
    const enabled = state.items
      .map((item, itemIndex) => ({ item, itemIndex }))
      .filter(({ item }) => !item.disabled);
    const target = enabled[(index + enabled.length) % enabled.length];
    if (target) elements.triggers[target.itemIndex]?.focus({ preventScroll: true });
  };
  const listeners = elements.triggers.map((trigger, index) => {
    const onClick = (event: MouseEvent): void => {
      event.preventDefault();
      toggle(index);
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      const enabledIndices = state.items
        .map((item, itemIndex) => (item.disabled ? -1 : itemIndex))
        .filter((itemIndex) => itemIndex >= 0);
      const current = enabledIndices.indexOf(index);
      let target: number | undefined;
      if (event.key === 'ArrowDown') target = current + 1;
      else if (event.key === 'ArrowUp') target = current - 1;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = enabledIndices.length - 1;
      else return;
      event.preventDefault();
      focusAt(target);
    };
    trigger.addEventListener('click', onClick);
    trigger.addEventListener('keydown', onKeyDown);
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
        state = resolveAccordionOptions(next);
        apply();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      listeners.forEach(({ onClick, onKeyDown }, index) => {
        elements.triggers[index]?.removeEventListener('click', onClick);
        elements.triggers[index]?.removeEventListener('keydown', onKeyDown);
      });
      all.forEach((element, index) => {
        const snapshot = snapshots[index];
        if (snapshot !== undefined) restore(element, snapshot);
      });
    },
  };
}
