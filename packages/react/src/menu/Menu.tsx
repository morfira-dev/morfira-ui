import { findMenuMatch, resolveMenuOptions } from '@morfira-dev/core/menu';
import type { MenuItem } from '@morfira-dev/core/menu';
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

export interface ReactMenuItem extends MenuItem {
  readonly label: ReactNode;
}

export type MenuDismissReason = 'escape' | 'tab' | 'select';
type NativeMenuProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onSelect'>;

export interface MenuProps extends NativeMenuProps {
  readonly items: readonly ReactMenuItem[];
  readonly loop?: boolean;
  readonly typeaheadTimeout?: number;
  readonly ariaLabel: string;
  readonly onSelect?: (id: string) => void;
  readonly onDismiss?: (reason: MenuDismissReason) => void;
  readonly ref?: Ref<HTMLDivElement>;
}

export function Menu({
  ariaLabel,
  items,
  loop = true,
  onDismiss,
  onSelect,
  ref,
  typeaheadTimeout = 700,
  ...nativeProps
}: MenuProps): ReactElement {
  const state = resolveMenuOptions({ items, loop, typeaheadTimeout });
  const first = state.items.findIndex((item) => !item.disabled);
  const [activeIndex, setActiveIndex] = useState(first);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const query = useRef('');
  const queryTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const focus = (index: number): void => {
    if (state.items[index]?.disabled !== false) return;
    setActiveIndex(index);
    itemRefs.current[index]?.focus({ preventScroll: true });
  };
  const enabled = state.items
    .map((item, index) => (item.disabled ? -1 : index))
    .filter((index) => index >= 0);
  const move = (delta: -1 | 1): void => {
    if (enabled.length === 0) return;
    const position = Math.max(0, enabled.indexOf(activeIndex));
    const candidate = position + delta;
    const next = state.loop
      ? ((candidate % enabled.length) + enabled.length) % enabled.length
      : Math.max(0, Math.min(enabled.length - 1, candidate));
    const index = enabled[next];
    if (index !== undefined) focus(index);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const index = event.key === 'Home' ? enabled[0] : enabled.at(-1);
      if (index !== undefined) focus(index);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onDismiss?.('escape');
    } else if (event.key === 'Tab') onDismiss?.('tab');
    else if (
      event.key.length === 1 &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      const repeated =
        query.current.length > 0 &&
        Array.from(query.current).every((value) => value === event.key);
      query.current = repeated ? event.key : `${query.current}${event.key}`;
      const index = findMenuMatch(state.items, query.current, activeIndex);
      if (index >= 0) focus(index);
      if (queryTimer.current !== undefined) clearTimeout(queryTimer.current);
      queryTimer.current = setTimeout(() => {
        query.current = '';
      }, state.typeaheadTimeout);
    }
  };

  return (
    <div
      {...nativeProps}
      ref={mergeRefs(ref)}
      role="menu"
      aria-label={ariaLabel}
      data-morfira-menu=""
      data-orientation="vertical"
      onKeyDown={onKeyDown}
    >
      {state.items.map((item, index) => (
        <button
          key={item.id}
          ref={(element): void => {
            itemRefs.current[index] = element;
          }}
          id={item.id}
          type="button"
          role="menuitem"
          aria-disabled={item.disabled || undefined}
          tabIndex={!item.disabled && index === activeIndex ? 0 : -1}
          data-morfira-menu-item=""
          data-state={item.disabled ? 'disabled' : 'enabled'}
          onFocus={(): void => {
            if (!item.disabled) setActiveIndex(index);
          }}
          onClick={(): void => {
            if (item.disabled) return;
            onSelect?.(item.id);
            onDismiss?.('select');
          }}
        >
          {items[index]?.label}
        </button>
      ))}
    </div>
  );
}
