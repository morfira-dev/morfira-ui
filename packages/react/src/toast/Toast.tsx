import {
  resolveToastOptions,
  type ToastDismissReason,
  type ToastOptions,
} from '@morfira-dev/core/toast';
import { enhanceToast, type ToastController } from '@morfira-dev/dom/toast';
import {
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

type NativeToastProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'aria-atomic' | 'aria-live' | 'children' | 'hidden' | 'role' | 'title'
>;

export interface ToastProps extends NativeToastProps, ToastOptions {
  readonly open: boolean;
  readonly title?: ReactNode;
  readonly children: ReactNode;
  readonly closeLabel?: string;
  readonly onDismiss?: (reason: ToastDismissReason) => void;
  readonly ref?: Ref<HTMLDivElement>;
}

function assignRef(ref: Ref<HTMLDivElement> | undefined, value: HTMLDivElement | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref !== null && ref !== undefined) ref.current = value;
}

export function Toast({
  children,
  closeLabel,
  duration = 5000,
  onDismiss,
  open,
  ref,
  title,
  tone = 'neutral',
  ...nativeProps
}: ToastProps): ReactElement {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<ToastController | null>(null);
  const callbackRef = useRef(onDismiss);
  callbackRef.current = onDismiss;
  const state = resolveToastOptions({ duration, open, tone });

  useLayoutEffect(() => {
    if (elementRef.current === null) return;
    const controller = enhanceToast(elementRef.current, {
      duration,
      open,
      tone,
      onDismiss: (reason) => callbackRef.current?.(reason),
    });
    controllerRef.current = controller;
    return () => {
      controller.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    controllerRef.current?.update({
      duration,
      open,
      tone,
      onDismiss: (reason) => callbackRef.current?.(reason),
    });
  }, [duration, open, tone]);

  return (
    <div
      {...nativeProps}
      ref={(element): void => {
        elementRef.current = element;
        assignRef(ref, element);
      }}
      role={state.role}
      aria-live={state.live}
      aria-atomic="true"
      hidden={!state.open}
      data-morfira-toast=""
      data-state={state.open ? 'open' : 'closed'}
      data-tone={state.tone}
      data-paused="false"
    >
      <div data-morfira-toast-content="">
        {title === undefined ? null : <div data-morfira-toast-title="">{title}</div>}
        <div data-morfira-toast-body="">{children}</div>
      </div>
      {closeLabel === undefined ? null : (
        <button
          type="button"
          aria-label={closeLabel}
          data-morfira-toast-close=""
          onClick={(): void => controllerRef.current?.requestDismiss('close-button')}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}
