import { resolvePopoverOptions } from '@morfira-dev/core/popover';
import type { PopoverOptions } from '@morfira-dev/core/popover';
import { enhancePopover } from '@morfira-dev/dom/popover';
import type { PopoverController, PopoverDismissReason } from '@morfira-dev/dom/popover';
import {
  cloneElement,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { assignRef, mergeRefs } from '../internal/merge-refs.js';

interface PopoverTriggerProps {
  readonly ref?: Ref<HTMLElement>;
  readonly 'aria-controls'?: string;
  readonly 'aria-expanded'?: boolean | 'true' | 'false';
  readonly 'aria-haspopup'?: 'dialog';
  readonly 'data-morfira-popover-trigger'?: string;
  readonly 'data-state'?: 'open' | 'closed';
}

type PopoverContentProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'aria-label' | 'children' | 'hidden' | 'id' | 'role'
>;

export interface PopoverProps extends Omit<PopoverOptions, 'open'> {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean, reason: PopoverDismissReason) => void;
  readonly children: ReactElement<PopoverTriggerProps>;
  readonly content: ReactNode;
  readonly ariaLabel: string;
  readonly contentProps?: PopoverContentProps;
  readonly contentRef?: Ref<HTMLDivElement>;
}

export function Popover({
  ariaLabel,
  children,
  closeOnEscape = true,
  closeOnOutsidePointer = true,
  content,
  contentId,
  contentProps,
  contentRef,
  defaultOpen = false,
  disabled = false,
  onOpenChange,
  open: controlledOpen,
  placement = 'block-end',
  restoreFocus = true,
}: PopoverProps): ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const triggerElement = useRef<HTMLElement | null>(null);
  const contentElement = useRef<HTMLDivElement | null>(null);
  const controller = useRef<PopoverController | null>(null);
  const callback = useRef(onOpenChange);
  callback.current = onOpenChange;

  const handleOpenChange = (nextOpen: boolean, reason: PopoverDismissReason): void => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    callback.current?.(nextOpen, reason);
  };

  useLayoutEffect(() => {
    if (triggerElement.current === null || contentElement.current === null) return;
    const instance = enhancePopover(triggerElement.current, contentElement.current, {
      closeOnEscape,
      closeOnOutsidePointer,
      contentId,
      disabled,
      onOpenChange: handleOpenChange,
      open,
      placement,
      restoreFocus,
    });
    controller.current = instance;
    return (): void => {
      instance.destroy();
      if (controller.current === instance) controller.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    controller.current?.update({
      closeOnEscape,
      closeOnOutsidePointer,
      contentId,
      disabled,
      onOpenChange: handleOpenChange,
      open,
      placement,
      restoreFocus,
    });
  }, [
    closeOnEscape,
    closeOnOutsidePointer,
    contentId,
    disabled,
    open,
    placement,
    restoreFocus,
  ]);

  const state = resolvePopoverOptions({
    closeOnEscape,
    closeOnOutsidePointer,
    contentId,
    disabled,
    open,
    placement,
    restoreFocus,
  });

  return (
    <>
      {cloneElement(children, {
        ref: mergeRefs(children.props.ref, triggerElement),
        'aria-controls': state.contentId,
        'aria-expanded': state.open,
        'aria-haspopup': 'dialog',
        'data-morfira-popover-trigger': '',
        'data-state': state.open ? 'open' : 'closed',
      })}
      <div
        {...contentProps}
        ref={(element): void => {
          contentElement.current = element;
          assignRef(contentRef, element);
        }}
        id={state.contentId}
        role="dialog"
        aria-label={ariaLabel}
        popover="manual"
        hidden={!state.open}
        data-morfira-popover=""
        data-placement={state.placement}
        data-state={state.open ? 'open' : 'closed'}
      >
        {content}
      </div>
    </>
  );
}
