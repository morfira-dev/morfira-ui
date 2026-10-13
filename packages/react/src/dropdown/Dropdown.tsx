import { resolveDropdownOptions } from '@morfira-dev/core/dropdown';
import type { DropdownOptions } from '@morfira-dev/core/dropdown';
import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from 'react';

import { assignRef, mergeRefs } from '../internal/merge-refs.js';
import { Menu, type ReactMenuItem } from '../menu/Menu.js';

export type DropdownOpenReason =
  | 'trigger'
  | 'arrow-first'
  | 'arrow-last'
  | 'escape'
  | 'outside-pointer'
  | 'tab'
  | 'select';

interface TriggerProps {
  readonly ref?: Ref<HTMLElement>;
  readonly 'aria-controls'?: string;
  readonly 'aria-expanded'?: boolean;
  readonly 'aria-haspopup'?: 'menu';
  readonly 'data-morfira-dropdown-trigger'?: string;
  readonly 'data-state'?: 'open' | 'closed';
  readonly onClick?: (event: MouseEvent<HTMLElement>) => void;
  readonly onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
}
type ContentProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'hidden' | 'id'>;

export interface DropdownProps extends Omit<DropdownOptions, 'open'> {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly ariaLabel: string;
  readonly items: readonly ReactMenuItem[];
  readonly children: ReactElement<TriggerProps>;
  readonly contentProps?: ContentProps;
  readonly contentRef?: Ref<HTMLDivElement>;
  readonly onOpenChange?: (open: boolean, reason: DropdownOpenReason) => void;
  readonly onSelect?: (id: string) => void;
}

export function Dropdown({
  ariaLabel,
  children,
  closeOnEscape = true,
  closeOnOutsidePointer = true,
  contentId,
  contentProps,
  contentRef,
  defaultOpen = false,
  disabled = false,
  items,
  onOpenChange,
  onSelect,
  open: controlledOpen,
  placement = 'block-end',
  restoreFocus = true,
}: DropdownProps): ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const state = resolveDropdownOptions({
    closeOnEscape,
    closeOnOutsidePointer,
    contentId,
    disabled,
    open,
    placement,
    restoreFocus,
  });
  const trigger = useRef<HTMLElement | null>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const pendingFocus = useRef<'first' | 'last' | undefined>(undefined);
  const restoreAfterClose = useRef(false);
  const previousOpen = useRef(open);
  const request = (next: boolean, reason: DropdownOpenReason): void => {
    if (state.disabled || next === state.open) return;
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next, reason);
  };
  useEffect(() => {
    if (!open) return;
    const itemsInMenu = content.current?.querySelectorAll<HTMLElement>(
      '[data-morfira-menu-item]:not([aria-disabled="true"])',
    );
    if (pendingFocus.current !== undefined && itemsInMenu?.length) {
      const target = pendingFocus.current === 'last' ? itemsInMenu.length - 1 : 0;
      itemsInMenu[target]?.focus({ preventScroll: true });
      pendingFocus.current = undefined;
    }
    const pointer = (event: PointerEvent): void => {
      const target = event.target as Node | null;
      if (
        closeOnOutsidePointer &&
        event.button === 0 &&
        event.isPrimary &&
        target &&
        !trigger.current?.contains(target) &&
        !content.current?.contains(target)
      )
        request(false, 'outside-pointer');
    };
    document.addEventListener('pointerdown', pointer);
    return (): void => {
      document.removeEventListener('pointerdown', pointer);
    };
  }, [open, closeOnOutsidePointer]);
  useEffect(() => {
    if (previousOpen.current && !open && restoreAfterClose.current && restoreFocus) {
      trigger.current?.focus({ preventScroll: true });
    }
    previousOpen.current = open;
    if (!open) restoreAfterClose.current = false;
  }, [open, restoreFocus]);
  const close = (reason: 'escape' | 'tab' | 'select'): void => {
    restoreAfterClose.current = reason !== 'tab';
    if (reason !== 'escape' || closeOnEscape) request(false, reason);
  };
  const onTriggerKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    pendingFocus.current = event.key === 'ArrowDown' ? 'first' : 'last';
    request(true, event.key === 'ArrowDown' ? 'arrow-first' : 'arrow-last');
  };

  return (
    <>
      {cloneElement(children, {
        ref: mergeRefs(children.props.ref, trigger),
        'aria-controls': state.contentId,
        'aria-expanded': state.open,
        'aria-haspopup': 'menu',
        'data-morfira-dropdown-trigger': '',
        'data-state': state.open ? 'open' : 'closed',
        onClick: (event): void => {
          children.props.onClick?.(event);
          if (!event.defaultPrevented) request(!state.open, 'trigger');
        },
        onKeyDown: (event): void => {
          children.props.onKeyDown?.(event);
          if (!event.defaultPrevented) onTriggerKeyDown(event);
        },
      })}
      <div
        {...contentProps}
        ref={(element): void => {
          content.current = element;
          assignRef(contentRef, element);
        }}
        id={state.contentId}
        hidden={!state.open}
        data-morfira-dropdown=""
        data-placement={state.placement}
        data-state={state.open ? 'open' : 'closed'}
      >
        <Menu
          ariaLabel={ariaLabel}
          items={items}
          {...(onSelect === undefined ? {} : { onSelect })}
          onDismiss={close}
        />
      </div>
    </>
  );
}
