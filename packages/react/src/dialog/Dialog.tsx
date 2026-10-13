import type {
  DialogDismissReason,
  DialogIds,
  DialogSize,
} from '@morfira-dev/core/dialog';
import { enhanceDialog } from '@morfira-dev/dom/dialog';
import type { DialogController } from '@morfira-dev/dom/dialog';
import {
  useCallback,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';

type NativeDialogProps = Omit<
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

export interface DialogProps extends NativeDialogProps {
  readonly open: boolean;
  readonly ids: DialogIds;
  readonly title: ReactNode;
  readonly closeLabel: string;
  readonly description?: ReactNode;
  readonly footer?: ReactNode;
  readonly size?: DialogSize;
  readonly closeOnEscape?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly lockScroll?: boolean;
  readonly restoreFocus?: boolean;
  readonly initialFocus?: RefObject<HTMLElement | null>;
  readonly returnFocus?: RefObject<HTMLElement | null>;
  readonly onDismiss?: (reason: DialogDismissReason) => void;
  readonly children: ReactNode;
  readonly ref?: Ref<HTMLDialogElement>;
}

function assignRef(
  ref: Ref<HTMLDialogElement> | undefined,
  value: HTMLDialogElement | null,
): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    ref.current = value;
  }
}

export function Dialog({
  children,
  className,
  closeLabel,
  closeOnBackdrop = false,
  closeOnEscape = true,
  description,
  footer,
  ids,
  initialFocus,
  lockScroll = true,
  onDismiss,
  open,
  ref,
  restoreFocus = true,
  returnFocus,
  size = 'md',
  title,
  ...nativeProps
}: DialogProps): ReactElement {
  if ((description === undefined) !== (ids.descriptionId === undefined)) {
    throw new TypeError(
      'Dialog description and ids.descriptionId must be provided together.',
    );
  }

  const elementRef = useRef<HTMLDialogElement | null>(null);
  const controllerRef = useRef<DialogController | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const setElementRef = useCallback(
    (element: HTMLDialogElement | null): void => {
      elementRef.current = element;
      assignRef(ref, element);
    },
    [ref],
  );

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (element === null) {
      return;
    }

    const controller = enhanceDialog(element, {
      ids,
      open,
      size,
      closeOnEscape,
      closeOnBackdrop,
      lockScroll,
      restoreFocus,
      ...(initialFocus === undefined
        ? {}
        : { initialFocus: (): HTMLElement | null => initialFocus.current }),
      ...(returnFocus === undefined
        ? {}
        : { returnFocus: (): HTMLElement | null => returnFocus.current }),
      onDismiss: (reason: DialogDismissReason): void => {
        onDismissRef.current?.(reason);
      },
    });
    controllerRef.current = controller;

    return (): void => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    controllerRef.current?.update({
      ids,
      open,
      size,
      closeOnEscape,
      closeOnBackdrop,
      lockScroll,
      restoreFocus,
      ...(initialFocus === undefined
        ? {}
        : { initialFocus: (): HTMLElement | null => initialFocus.current }),
      ...(returnFocus === undefined
        ? {}
        : { returnFocus: (): HTMLElement | null => returnFocus.current }),
      onDismiss: (reason: DialogDismissReason): void => {
        onDismissRef.current?.(reason);
      },
    });
  }, [
    closeOnBackdrop,
    closeOnEscape,
    ids,
    initialFocus,
    lockScroll,
    open,
    restoreFocus,
    returnFocus,
    size,
  ]);

  return (
    <dialog
      {...nativeProps}
      ref={setElementRef}
      className={className}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ids.titleId}
      aria-describedby={ids.descriptionId}
      tabIndex={-1}
      data-morfira-dialog=""
      data-state={open ? 'open' : 'closed'}
      data-size={size}
    >
      <header data-morfira-dialog-header="">
        <div>
          <h2 id={ids.titleId} data-morfira-dialog-title="">
            {title}
          </h2>
          {description === undefined ? null : (
            <div id={ids.descriptionId} data-morfira-dialog-description="">
              {description}
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label={closeLabel}
          data-morfira-dialog-close=""
          onClick={(): void => {
            controllerRef.current?.requestClose('close-button');
          }}
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>
      <div data-morfira-dialog-body="">{children}</div>
      {footer === undefined ? null : (
        <footer data-morfira-dialog-footer="">{footer}</footer>
      )}
    </dialog>
  );
}
