import { resolveTooltipOptions } from '@morfira-dev/core/tooltip';
import type { TooltipOptions } from '@morfira-dev/core/tooltip';
import { enhanceTooltip } from '@morfira-dev/dom/tooltip';
import type { TooltipController, TooltipDomOptions } from '@morfira-dev/dom/tooltip';
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

type TooltipReason = Parameters<NonNullable<TooltipDomOptions['onOpenChange']>>[1];

interface TooltipTriggerProps {
  readonly ref?: Ref<HTMLElement>;
  readonly 'aria-describedby'?: string;
  readonly 'data-morfira-tooltip-trigger'?: string;
  readonly 'data-state'?: 'open' | 'closed';
}

type TooltipContentProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'hidden' | 'id' | 'role'
>;

export interface TooltipProps extends Omit<TooltipOptions, 'open'> {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean, reason: TooltipReason) => void;
  readonly children: ReactElement<TooltipTriggerProps>;
  readonly content: ReactNode;
  readonly contentProps?: TooltipContentProps;
  readonly contentRef?: Ref<HTMLDivElement>;
}

export function Tooltip({
  children,
  closeDelay = 100,
  content,
  contentId,
  contentProps,
  contentRef,
  defaultOpen = false,
  disabled = false,
  onOpenChange,
  open: controlledOpen,
  openDelay = 500,
  placement = 'block-start',
}: TooltipProps): ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const triggerElement = useRef<HTMLElement | null>(null);
  const contentElement = useRef<HTMLDivElement | null>(null);
  const controller = useRef<TooltipController | null>(null);
  const callback = useRef(onOpenChange);
  callback.current = onOpenChange;

  const handleOpenChange = (nextOpen: boolean, reason: TooltipReason): void => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    callback.current?.(nextOpen, reason);
  };

  useLayoutEffect(() => {
    if (triggerElement.current === null || contentElement.current === null) {
      return;
    }
    const instance = enhanceTooltip(triggerElement.current, contentElement.current, {
      closeDelay,
      contentId,
      disabled,
      onOpenChange: handleOpenChange,
      open,
      openDelay,
      placement,
    });
    controller.current = instance;
    return (): void => {
      instance.destroy();
      if (controller.current === instance) controller.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    controller.current?.update({
      closeDelay,
      contentId,
      disabled,
      onOpenChange: handleOpenChange,
      open,
      openDelay,
      placement,
    });
  }, [closeDelay, contentId, disabled, open, openDelay, placement]);

  const state = resolveTooltipOptions({
    closeDelay,
    contentId,
    disabled,
    open,
    openDelay,
    placement,
  });
  const describedBy = state.open
    ? [...new Set([children.props['aria-describedby'], state.contentId])]
        .filter((value): value is string => value !== undefined && value.length > 0)
        .join(' ')
    : children.props['aria-describedby'];

  return (
    <>
      {cloneElement(children, {
        ref: mergeRefs(children.props.ref, triggerElement),
        ...(describedBy === undefined ? {} : { 'aria-describedby': describedBy }),
        'data-morfira-tooltip-trigger': '',
        'data-state': state.open ? 'open' : 'closed',
      })}
      <div
        {...contentProps}
        ref={(element): void => {
          contentElement.current = element;
          assignRef(contentRef, element);
        }}
        id={state.contentId}
        role="tooltip"
        hidden={!state.open}
        data-morfira-tooltip=""
        data-placement={state.placement}
        data-state={state.open ? 'open' : 'closed'}
      >
        {content}
      </div>
    </>
  );
}
