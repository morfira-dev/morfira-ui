import { resolveTabsOptions } from '@morfira-dev/core/tabs';
import type {
  ResolvedTabItem,
  TabItem,
  TabsActivationMode,
  TabsOrientation,
} from '@morfira-dev/core/tabs';
import {
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { mergeRefs } from '../internal/merge-refs.js';

export interface ReactTabItem extends TabItem {
  readonly label: ReactNode;
  readonly content: ReactNode;
}

type NativeTabsProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

export function resolveFocusedTabId(
  items: readonly ResolvedTabItem[],
  selectedId: string | undefined,
  focusedId: string | undefined,
): string | undefined {
  return items.some((item) => item.tabId === focusedId && !item.disabled)
    ? focusedId
    : selectedId;
}

export interface TabsProps extends NativeTabsProps {
  readonly items: readonly ReactTabItem[];
  readonly selectedId?: string;
  readonly defaultSelectedId?: string;
  readonly orientation?: TabsOrientation;
  readonly activationMode?: TabsActivationMode;
  readonly loop?: boolean;
  readonly onSelectedChange?: (tabId: string) => void;
  readonly ref?: Ref<HTMLDivElement>;
}

export function Tabs({
  activationMode = 'automatic',
  defaultSelectedId,
  items,
  loop = true,
  onSelectedChange,
  orientation = 'horizontal',
  ref,
  selectedId: controlledSelectedId,
  ...nativeProps
}: TabsProps): ReactElement {
  const [uncontrolledSelectedId, setUncontrolledSelectedId] =
    useState(defaultSelectedId);
  const requestedSelectedId = controlledSelectedId ?? uncontrolledSelectedId;
  const selectedId =
    requestedSelectedId === undefined ||
    items.some((item) => item.tabId === requestedSelectedId)
      ? requestedSelectedId
      : controlledSelectedId === undefined
        ? undefined
        : requestedSelectedId;
  const state = resolveTabsOptions({
    activationMode,
    items,
    loop,
    orientation,
    ...(selectedId === undefined ? {} : { selectedId }),
  });
  const [focusedId, setFocusedId] = useState<string>();
  const rovingId = resolveFocusedTabId(state.items, state.selectedId, focusedId);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (tabId: string): void => {
    if (controlledSelectedId === undefined) setUncontrolledSelectedId(tabId);
    if (tabId !== state.selectedId) onSelectedChange?.(tabId);
  };

  const enabledIndices = state.items
    .map((item, index) => (item.disabled ? -1 : index))
    .filter((index) => index >= 0);

  const focusFrom = (index: number, delta: -1 | 1): void => {
    const position = enabledIndices.indexOf(index);
    if (position < 0 || enabledIndices.length === 0) return;
    let nextPosition = position + delta;
    if (loop)
      nextPosition = (nextPosition + enabledIndices.length) % enabledIndices.length;
    else nextPosition = Math.max(0, Math.min(enabledIndices.length - 1, nextPosition));
    const nextIndex = enabledIndices[nextPosition];
    if (nextIndex === undefined) return;
    const item = state.items[nextIndex];
    if (item === undefined) return;
    setFocusedId(item.tabId);
    tabRefs.current[nextIndex]?.focus();
    if (state.activationMode === 'automatic') select(item.tabId);
  };

  const onTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void => {
    const horizontal = state.orientation === 'horizontal';
    const rtl =
      horizontal &&
      rootRef.current !== null &&
      getComputedStyle(rootRef.current).direction === 'rtl';
    if (event.key === (horizontal ? 'ArrowLeft' : 'ArrowUp')) {
      event.preventDefault();
      focusFrom(index, rtl ? 1 : -1);
    } else if (event.key === (horizontal ? 'ArrowRight' : 'ArrowDown')) {
      event.preventDefault();
      focusFrom(index, rtl ? -1 : 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const nextIndex =
        event.key === 'Home' ? enabledIndices[0] : enabledIndices.at(-1);
      if (nextIndex === undefined) return;
      const item = state.items[nextIndex];
      if (item !== undefined) setFocusedId(item.tabId);
      tabRefs.current[nextIndex]?.focus();
      if (item !== undefined && state.activationMode === 'automatic')
        select(item.tabId);
    } else if (
      state.activationMode === 'manual' &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      event.preventDefault();
      const item = state.items[index];
      if (item !== undefined && !item.disabled) select(item.tabId);
    }
  };

  return (
    <div {...nativeProps} ref={mergeRefs(rootRef, ref)} data-morfira-tabs-root="">
      <div
        role="tablist"
        aria-orientation={state.orientation}
        data-morfira-tabs=""
        data-orientation={state.orientation}
      >
        {state.items.map((item, index) => {
          const selected = item.tabId === state.selectedId;
          return (
            <button
              key={item.tabId}
              ref={(element): void => {
                tabRefs.current[index] = element;
              }}
              id={item.tabId}
              type="button"
              role="tab"
              disabled={item.disabled}
              aria-disabled={item.disabled || undefined}
              aria-controls={item.panelId}
              aria-selected={selected}
              tabIndex={item.tabId === rovingId ? 0 : -1}
              data-morfira-tab=""
              data-state={selected ? 'active' : 'inactive'}
              onClick={(): void => {
                setFocusedId(item.tabId);
                select(item.tabId);
              }}
              onFocus={(): void => {
                setFocusedId(item.tabId);
              }}
              onKeyDown={(event): void => {
                onTabKeyDown(event, index);
              }}
            >
              {items[index]?.label}
            </button>
          );
        })}
      </div>
      {state.items.map((item, index) => {
        const selected = item.tabId === state.selectedId;
        return (
          <div
            key={item.panelId}
            id={item.panelId}
            role="tabpanel"
            aria-labelledby={item.tabId}
            hidden={!selected}
            tabIndex={selected ? 0 : undefined}
            data-morfira-tab-panel=""
            data-state={selected ? 'active' : 'inactive'}
          >
            {items[index]?.content}
          </div>
        );
      })}
    </div>
  );
}
