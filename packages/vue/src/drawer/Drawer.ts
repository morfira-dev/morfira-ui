import {
  DRAWER_SIDES,
  DRAWER_SIZES,
  resolveDrawerOptions,
  type DrawerDismissReason,
  type DrawerIds,
  type DrawerSide,
  type DrawerSize,
} from '@morfira-dev/core/drawer';
import {
  enhanceDrawer,
  type DrawerController,
  type DrawerDomOptions,
  type DrawerFocusTarget,
} from '@morfira-dev/dom/drawer';
import {
  defineComponent,
  h,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watchEffect,
} from 'vue';
import type {
  ComponentPublicInstance,
  DefineComponent,
  DialogHTMLAttributes,
  PropType,
  VNode,
} from 'vue';

type NativeDrawerProps = Omit<
  DialogHTMLAttributes,
  | 'aria-describedby'
  | 'aria-labelledby'
  | 'aria-modal'
  | 'onCancel'
  | 'onClose'
  | 'open'
  | 'role'
  | 'title'
>;

export interface DrawerProps extends NativeDrawerProps {
  readonly modelValue?: boolean;
  readonly defaultOpen?: boolean;
  readonly ids: DrawerIds;
  readonly title: string;
  readonly closeLabel: string;
  readonly description?: string;
  readonly footer?: string;
  readonly modal?: boolean;
  readonly side?: DrawerSide;
  readonly size?: DrawerSize;
  readonly closeOnEscape?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly lockScroll?: boolean;
  readonly restoreFocus?: boolean;
  readonly initialFocus?: DrawerFocusTarget;
  readonly returnFocus?: DrawerFocusTarget;
}

export const Drawer = defineComponent({
  name: 'MorfiraDrawer',
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    ids: { type: Object as PropType<DrawerIds>, required: true },
    title: { type: String, required: true },
    closeLabel: { type: String, required: true },
    description: String,
    footer: String,
    modal: { type: Boolean, default: true },
    side: {
      type: String as PropType<DrawerSide>,
      default: 'inline-end',
      validator: (value: unknown) => DRAWER_SIDES.includes(value as DrawerSide),
    },
    size: {
      type: String as PropType<DrawerSize>,
      default: 'md',
      validator: (value: unknown) => DRAWER_SIZES.includes(value as DrawerSize),
    },
    closeOnEscape: { type: Boolean, default: true },
    closeOnBackdrop: { type: Boolean, default: false },
    lockScroll: { type: Boolean, default: true },
    restoreFocus: { type: Boolean, default: true },
    initialFocus: [Object, Function] as PropType<DrawerFocusTarget>,
    returnFocus: [Object, Function] as PropType<DrawerFocusTarget>,
  },
  emits: {
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    dismiss: (reason: DrawerDismissReason) => Boolean(reason),
  },
  setup(props, { attrs, emit, slots }): () => VNode {
    const uncontrolled = ref(props.defaultOpen);
    const element = shallowRef<HTMLDialogElement | null>(null);
    const controller = shallowRef<DrawerController | null>(null);
    const currentOpen = () => props.modelValue ?? uncontrolled.value ?? false;
    const dismiss = (reason: DrawerDismissReason): void => {
      if (props.modelValue === undefined) uncontrolled.value = false;
      emit('update:modelValue', false);
      emit('dismiss', reason);
    };
    const options = (): DrawerDomOptions => ({
      ids: props.ids,
      open: currentOpen(),
      modal: props.modal ?? true,
      side: props.side ?? 'inline-end',
      size: props.size ?? 'md',
      closeOnEscape: props.closeOnEscape ?? true,
      closeOnBackdrop: props.closeOnBackdrop ?? false,
      lockScroll: props.lockScroll ?? true,
      restoreFocus: props.restoreFocus ?? true,
      ...(props.initialFocus === undefined ? {} : { initialFocus: props.initialFocus }),
      ...(props.returnFocus === undefined ? {} : { returnFocus: props.returnFocus }),
      onDismiss: dismiss,
    });
    onMounted(() => {
      if (element.value !== null) {
        controller.value = enhanceDrawer(element.value, options());
      }
    });
    watchEffect(() => controller.value?.update(options()));
    onBeforeUnmount(() => {
      controller.value?.destroy();
      controller.value = null;
    });

    return () => {
      const state = resolveDrawerOptions(options());
      const description = slots.description?.() ?? props.description;
      const footer = slots.footer?.() ?? props.footer;
      if ((description === undefined) !== (state.ids.descriptionId === undefined)) {
        throw new TypeError(
          'Drawer description and ids.descriptionId must be provided together.',
        );
      }
      return h(
        'dialog',
        mergeProps(attrs, {
          ref: (value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLDialogElement | null;
          },
          role: 'dialog',
          'aria-modal': state.modal ? 'true' : undefined,
          'aria-labelledby': state.ids.titleId,
          'aria-describedby': state.ids.descriptionId,
          tabindex: -1,
          'data-morfira-drawer': '',
          'data-state': state.open ? 'open' : 'closed',
          'data-modal': String(state.modal),
          'data-side': state.side,
          'data-size': state.size,
        }),
        [
          h('header', { 'data-morfira-drawer-header': '' }, [
            h('div', [
              h(
                'h2',
                { id: state.ids.titleId, 'data-morfira-drawer-title': '' },
                slots.title?.() ?? props.title,
              ),
              description === undefined
                ? null
                : h(
                    'div',
                    {
                      id: state.ids.descriptionId,
                      'data-morfira-drawer-description': '',
                    },
                    description,
                  ),
            ]),
            h(
              'button',
              {
                type: 'button',
                'aria-label': props.closeLabel,
                'data-morfira-drawer-close': '',
                onClick: () => controller.value?.requestClose('close-button'),
              },
              [h('span', { 'aria-hidden': 'true' }, '×')],
            ),
          ]),
          h('div', { 'data-morfira-drawer-body': '' }, slots.default?.()),
          footer === undefined
            ? null
            : h('footer', { 'data-morfira-drawer-footer': '' }, footer),
        ],
      );
    };
  },
}) as DefineComponent<DrawerProps>;
