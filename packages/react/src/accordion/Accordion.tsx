import { resolveAccordionOptions } from '@morfira-dev/core/accordion';
import type { AccordionItem } from '@morfira-dev/core/accordion';
import {
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

export interface ReactAccordionItem extends AccordionItem {
  readonly title: ReactNode;
  readonly content: ReactNode;
}

type NativeAccordionProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

export interface AccordionProps extends NativeAccordionProps {
  readonly items: readonly ReactAccordionItem[];
  readonly expandedIds?: readonly string[];
  readonly defaultExpandedIds?: readonly string[];
  readonly multiple?: boolean;
  readonly collapsible?: boolean;
  readonly onExpandedChange?: (expandedIds: readonly string[]) => void;
  readonly ref?: Ref<HTMLDivElement>;
}

export function Accordion({
  collapsible = true,
  defaultExpandedIds = [],
  expandedIds: controlledExpandedIds,
  items,
  multiple = false,
  onExpandedChange,
  ref,
  ...nativeProps
}: AccordionProps): ReactElement {
  const [uncontrolledExpandedIds, setUncontrolledExpandedIds] =
    useState(defaultExpandedIds);
  const requestedExpandedIds = controlledExpandedIds ?? uncontrolledExpandedIds;
  const validExpandedIds = requestedExpandedIds.filter((id) =>
    items.some((item) => item.triggerId === id),
  );
  const state = resolveAccordionOptions({
    collapsible,
    expandedIds:
      controlledExpandedIds === undefined ? validExpandedIds : requestedExpandedIds,
    items,
    multiple,
  });
  const triggerRefs = useRef<(HTMLElement | null)[]>([]);
  const enabledIndices = state.items
    .map((item, index) => (item.disabled ? -1 : index))
    .filter((index) => index >= 0);

  const update = (next: readonly string[]): void => {
    if (controlledExpandedIds === undefined) setUncontrolledExpandedIds(next);
    onExpandedChange?.(next);
  };

  const toggle = (index: number): void => {
    const item = state.items[index];
    if (item === undefined || item.disabled) return;
    const expanded = state.expandedIds.includes(item.triggerId);
    if (expanded && !state.collapsible && state.expandedIds.length === 1) return;
    update(
      expanded
        ? state.expandedIds.filter((id) => id !== item.triggerId)
        : state.multiple
          ? [...state.expandedIds, item.triggerId]
          : [item.triggerId],
    );
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLElement>, index: number): void => {
    const position = enabledIndices.indexOf(index);
    let nextPosition: number | undefined;
    if (event.key === 'ArrowDown') nextPosition = position + 1;
    else if (event.key === 'ArrowUp') nextPosition = position - 1;
    else if (event.key === 'Home') nextPosition = 0;
    else if (event.key === 'End') nextPosition = enabledIndices.length - 1;
    else return;
    event.preventDefault();
    if (enabledIndices.length === 0) return;
    const wrapped =
      ((nextPosition % enabledIndices.length) + enabledIndices.length) %
      enabledIndices.length;
    const nextIndex = enabledIndices[wrapped];
    if (nextIndex !== undefined) triggerRefs.current[nextIndex]?.focus();
  };

  return (
    <div {...nativeProps} ref={ref} data-morfira-accordion="">
      {state.items.map((item, index) => {
        const expanded = state.expandedIds.includes(item.triggerId);
        return (
          <details
            key={item.triggerId}
            open={expanded}
            data-morfira-accordion-item=""
            data-state={expanded ? 'open' : 'closed'}
          >
            <summary
              ref={(element): void => {
                triggerRefs.current[index] = element;
              }}
              id={item.triggerId}
              aria-controls={item.panelId}
              aria-expanded={expanded}
              aria-disabled={item.disabled || undefined}
              tabIndex={item.disabled ? -1 : undefined}
              data-morfira-accordion-trigger=""
              data-state={expanded ? 'open' : 'closed'}
              onClick={(event): void => {
                event.preventDefault();
                toggle(index);
              }}
              onKeyDown={(event): void => {
                onTriggerKeyDown(event, index);
              }}
            >
              {items[index]?.title}
            </summary>
            <div
              id={item.panelId}
              role="region"
              aria-labelledby={item.triggerId}
              hidden={!expanded}
              data-morfira-accordion-panel=""
              data-state={expanded ? 'open' : 'closed'}
            >
              {items[index]?.content}
            </div>
          </details>
        );
      })}
    </div>
  );
}
