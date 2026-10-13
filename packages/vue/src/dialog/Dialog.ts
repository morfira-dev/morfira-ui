import {
  DIALOG_SIZES,
  type DialogDismissReason,
  type DialogIds,
  type DialogSize,
} from '@morfira-dev/core/dialog';
import { enhanceDialog } from '@morfira-dev/dom/dialog';
import type {
  DialogController,
  DialogDomOptions,
  DialogFocusTarget,
} from '@morfira-dev/dom/dialog';
import {
  defineComponent,
  h,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watchEffect,
} from 'vue';
import type {
  ComponentPublicInstance,
  DefineComponent,
  DialogHTMLAttributes,
  PropType,
  ShallowRef,
  VNode,
} from 'vue';

type NativeDialogProps = Omit<
  DialogHTMLAttributes,
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
  readonly title: string;
  readonly closeLabel: string;
  readonly description?: string | undefined;
  readonly footer?: string | undefined;
  readonly size?: DialogSize | undefined;
  readonly closeOnEscape?: boolean | undefined;
  readonly closeOnBackdrop?: boolean | undefined;
  readonly lockScroll?: boolean | undefined;
  readonly restoreFocus?: boolean | undefined;
  readonly initialFocus?: DialogFocusTarget | undefined;
  readonly returnFocus?: DialogFocusTarget | undefined;
  readonly onDismiss?: ((reason: DialogDismissReason) => void) | undefined;
}

export interface DialogExposed {
  readonly element: HTMLDialogElement | null;
}

function createControllerOptions(
  props: Readonly<DialogProps>,
  onDismiss: (reason: DialogDismissReason) => void,
): DialogDomOptions {
  return {
    ids: props.ids,
    open: props.open,
    size: props.size ?? 'md',
    closeOnEscape: props.closeOnEscape ?? true,
    closeOnBackdrop: props.closeOnBackdrop ?? false,
    lockScroll: props.lockScroll ?? true,
    restoreFocus: props.restoreFocus ?? true,
    ...(props.initialFocus === undefined ? {} : { initialFocus: props.initialFocus }),
    ...(props.returnFocus === undefined ? {} : { returnFocus: props.returnFocus }),
    onDismiss,
  };
}

const DialogComponent = defineComponent({
  name: 'MorfiraDialog',
  inheritAttrs: false,
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    ids: {
      type: Object as PropType<DialogIds>,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    closeLabel: {
      type: String,
      required: true,
    },
    description: String,
    footer: String,
    size: {
      type: String as PropType<DialogSize>,
      default: 'md',
      validator: (value: unknown): boolean =>
        DIALOG_SIZES.includes(value as DialogSize),
    },
    closeOnEscape: {
      type: Boolean,
      default: true,
    },
    closeOnBackdrop: {
      type: Boolean,
      default: false,
    },
    lockScroll: {
      type: Boolean,
      default: true,
    },
    restoreFocus: {
      type: Boolean,
      default: true,
    },
    initialFocus: [Object, Function] as PropType<DialogFocusTarget>,
    returnFocus: [Object, Function] as PropType<DialogFocusTarget>,
  },
  emits: {
    dismiss: (reason: DialogDismissReason): boolean => Boolean(reason),
  },
  setup(props, { attrs, emit, expose, slots }): () => VNode {
    const element: ShallowRef<HTMLDialogElement | null> = shallowRef(null);
    const controller: ShallowRef<DialogController | null> = shallowRef(null);
    const emitDismiss = (reason: DialogDismissReason): void => {
      emit('dismiss', reason);
    };

    expose({
      get element(): HTMLDialogElement | null {
        return element.value;
      },
    });

    onMounted((): void => {
      if (element.value !== null) {
        controller.value = enhanceDialog(
          element.value,
          createControllerOptions(props, emitDismiss),
        );
      }
    });

    watchEffect((): void => {
      controller.value?.update(createControllerOptions(props, emitDismiss));
    });

    onBeforeUnmount((): void => {
      controller.value?.destroy();
      controller.value = null;
    });

    return (): VNode => {
      const titleContent = slots.title?.() ?? props.title;
      const descriptionContent = slots.description?.() ?? props.description;
      const footerContent = slots.footer?.() ?? props.footer;

      if (
        (descriptionContent === undefined) !==
        (props.ids.descriptionId === undefined)
      ) {
        throw new TypeError(
          'Dialog description and ids.descriptionId must be provided together.',
        );
      }

      return h(
        'dialog',
        mergeProps(attrs, {
          ref: (value: Element | ComponentPublicInstance | null): void => {
            element.value = value as HTMLDialogElement | null;
          },
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': props.ids.titleId,
          'aria-describedby': props.ids.descriptionId,
          tabindex: -1,
          'data-morfira-dialog': '',
          'data-state': props.open ? 'open' : 'closed',
          'data-size': props.size,
        }),
        [
          h('header', { 'data-morfira-dialog-header': '' }, [
            h('div', [
              h(
                'h2',
                {
                  id: props.ids.titleId,
                  'data-morfira-dialog-title': '',
                },
                titleContent,
              ),
              descriptionContent === undefined
                ? null
                : h(
                    'div',
                    {
                      id: props.ids.descriptionId,
                      'data-morfira-dialog-description': '',
                    },
                    descriptionContent,
                  ),
            ]),
            h(
              'button',
              {
                type: 'button',
                'aria-label': props.closeLabel,
                'data-morfira-dialog-close': '',
                onClick: (): void => {
                  controller.value?.requestClose('close-button');
                },
              },
              [h('span', { 'aria-hidden': 'true' }, '×')],
            ),
          ]),
          h('div', { 'data-morfira-dialog-body': '' }, slots.default?.()),
          footerContent === undefined
            ? null
            : h('footer', { 'data-morfira-dialog-footer': '' }, footerContent),
        ],
      );
    };
  },
});

export const Dialog = DialogComponent as unknown as DefineComponent<
  DialogProps,
  DialogExposed
>;
