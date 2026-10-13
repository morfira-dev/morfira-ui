import {
  TOAST_TONES,
  resolveToastOptions,
  type ToastDismissReason,
  type ToastTone,
} from '@morfira-dev/core/toast';
import {
  enhanceToast,
  type ToastController,
  type ToastDomOptions,
} from '@morfira-dev/dom/toast';
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
  HTMLAttributes,
  PropType,
  VNode,
} from 'vue';

type NativeToastProps = Omit<
  HTMLAttributes,
  'aria-atomic' | 'aria-live' | 'hidden' | 'role' | 'title'
>;

export interface ToastProps extends NativeToastProps {
  readonly modelValue?: boolean;
  readonly defaultOpen?: boolean;
  readonly title?: string;
  readonly closeLabel?: string;
  readonly tone?: ToastTone;
  readonly duration?: number | null;
}

export const Toast = defineComponent({
  name: 'MorfiraToast',
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: true },
    title: String,
    closeLabel: String,
    tone: {
      type: String as PropType<ToastTone>,
      default: 'neutral',
      validator: (value: unknown) => TOAST_TONES.includes(value as ToastTone),
    },
    duration: { type: Number as PropType<number | null>, default: 5000 },
  },
  emits: {
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    dismiss: (reason: ToastDismissReason) => Boolean(reason),
  },
  setup(props, { attrs, emit, slots }): () => VNode {
    const uncontrolled = ref(props.defaultOpen);
    const element = shallowRef<HTMLElement | null>(null);
    const controller = shallowRef<ToastController | null>(null);
    const currentOpen = () => props.modelValue ?? uncontrolled.value ?? true;
    const dismiss = (reason: ToastDismissReason): void => {
      if (props.modelValue === undefined) uncontrolled.value = false;
      emit('update:modelValue', false);
      emit('dismiss', reason);
    };
    const options = (): ToastDomOptions => ({
      open: currentOpen(),
      tone: props.tone ?? 'neutral',
      duration: props.duration ?? null,
      onDismiss: dismiss,
    });
    onMounted(() => {
      if (element.value !== null) {
        controller.value = enhanceToast(element.value, options());
      }
    });
    watchEffect(() => controller.value?.update(options()));
    onBeforeUnmount(() => {
      controller.value?.destroy();
      controller.value = null;
    });

    return () => {
      const state = resolveToastOptions(options());
      return h(
        'div',
        mergeProps(attrs, {
          ref: (value: Element | ComponentPublicInstance | null) => {
            element.value = value as HTMLElement | null;
          },
          role: state.role,
          'aria-live': state.live,
          'aria-atomic': 'true',
          hidden: !state.open,
          'data-morfira-toast': '',
          'data-state': state.open ? 'open' : 'closed',
          'data-tone': state.tone,
          'data-paused': 'false',
        }),
        [
          h('div', { 'data-morfira-toast-content': '' }, [
            props.title === undefined
              ? null
              : h(
                  'div',
                  { 'data-morfira-toast-title': '' },
                  slots.title?.() ?? props.title,
                ),
            h('div', { 'data-morfira-toast-body': '' }, slots.default?.()),
          ]),
          props.closeLabel === undefined
            ? null
            : h(
                'button',
                {
                  type: 'button',
                  'aria-label': props.closeLabel,
                  'data-morfira-toast-close': '',
                  onClick: () => controller.value?.requestDismiss('close-button'),
                },
                [h('span', { 'aria-hidden': 'true' }, '×')],
              ),
        ],
      );
    };
  },
}) as DefineComponent<ToastProps>;
