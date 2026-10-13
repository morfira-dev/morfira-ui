import type {
  DrawerDismissReason,
  DrawerIds,
  DrawerOptions,
} from '@morfira-dev/core/drawer';
import { resolveDrawerOptions } from '@morfira-dev/core/drawer';
import { enhanceDrawer, type DrawerController } from '@morfira-dev/dom/drawer';
import {
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';

type NativeDrawerProps = Omit<
  ComponentPropsWithoutRef<'dialog'>,
  | 'aria-describedby'
  | 'aria-labelledby'
  | 'aria-modal'
  | 'children'
  | 'onCancel'
  | 'onClose'
  | 'open'
  | 'role'
  | 'title'
>;

export interface DrawerProps extends NativeDrawerProps, DrawerOptions {
  readonly open: boolean;
  readonly ids: DrawerIds;
  readonly title: ReactNode;
  readonly closeLabel: string;
  readonly description?: ReactNode;
  readonly footer?: ReactNode;
  readonly children: ReactNode;
  readonly initialFocus?: RefObject<HTMLElement | null>;
  readonly returnFocus?: RefObject<HTMLElement | null>;
  readonly onDismiss?: (reason: DrawerDismissReason) => void;
  readonly ref?: Ref<HTMLDialogElement>;
}

function assignRef(
  ref: Ref<HTMLDialogElement> | undefined,
  value: HTMLDialogElement | null,
): void {
  if (typeof ref === 'function') ref(value);
  else if (ref !== null && ref !== undefined) ref.current = value;
}

export function Drawer({
  children,
  closeLabel,
  closeOnBackdrop = false,
  closeOnEscape = true,
  description,
  footer,
  ids,
  initialFocus,
  lockScroll = true,
  modal = true,
  onDismiss,
  open,
  ref,
  restoreFocus = true,
  returnFocus,
  side = 'inline-end',
  size = 'md',
  title,
  ...nativeProps
}: DrawerProps): ReactElement {
  if ((description === undefined) !== (ids.descriptionId === undefined)) {
    throw new TypeError(
      'Drawer description and ids.descriptionId must be provided together.',
    );
  }
  const state = resolveDrawerOptions({
    closeOnBackdrop,
    closeOnEscape,
    ids,
    lockScroll,
    modal,
    open,
    restoreFocus,
    side,
    size,
  });
  const elementRef = useRef<HTMLDialogElement | null>(null);
  const controllerRef = useRef<DrawerController | null>(null);
  const callbackRef = useRef(onDismiss);
  callbackRef.current = onDismiss;
  const options = () => ({
    ...state,
    ...(initialFocus === undefined
      ? {}
      : { initialFocus: (): HTMLElement | null => initialFocus.current }),
    ...(returnFocus === undefined
      ? {}
      : { returnFocus: (): HTMLElement | null => returnFocus.current }),
    onDismiss: (reason: DrawerDismissReason) => callbackRef.current?.(reason),
  });

  useLayoutEffect(() => {
    if (elementRef.current === null) return;
    const controller = enhanceDrawer(elementRef.current, options());
    controllerRef.current = controller;
    return () => {
      controller.destroy();
    };
  }, []);
  useLayoutEffect(() => {
    controllerRef.current?.update(options());
  }, [
    closeOnBackdrop,
    closeOnEscape,
    ids,
    initialFocus,
    lockScroll,
    modal,
    open,
    restoreFocus,
    returnFocus,
    side,
    size,
  ]);

  return (
    <dialog
      {...nativeProps}
      ref={(element): void => {
        elementRef.current = element;
        assignRef(ref, element);
      }}
      role="dialog"
      aria-modal={state.modal ? 'true' : undefined}
      aria-labelledby={state.ids.titleId}
      aria-describedby={state.ids.descriptionId}
      tabIndex={-1}
      data-morfira-drawer=""
      data-state={state.open ? 'open' : 'closed'}
      data-modal={String(state.modal)}
      data-side={state.side}
      data-size={state.size}
    >
      <header data-morfira-drawer-header="">
        <div>
          <h2 id={state.ids.titleId} data-morfira-drawer-title="">
            {title}
          </h2>
          {description === undefined ? null : (
            <div id={state.ids.descriptionId} data-morfira-drawer-description="">
              {description}
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label={closeLabel}
          data-morfira-drawer-close=""
          onClick={(): void => controllerRef.current?.requestClose('close-button')}
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>
      <div data-morfira-drawer-body="">{children}</div>
      {footer === undefined ? null : (
        <footer data-morfira-drawer-footer="">{footer}</footer>
      )}
    </dialog>
  );
}
