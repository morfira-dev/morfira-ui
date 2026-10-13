import { POPOVER_PLACEMENTS, resolvePopoverOptions } from '@morfira-dev/core/popover';
import type { PopoverPlacement } from '@morfira-dev/core/popover';
import { enhancePopover } from '@morfira-dev/dom/popover';
import type {
  PopoverController,
  PopoverDismissReason,
  PopoverDomOptions,
} from '@morfira-dev/dom/popover';
import {
  cloneVNode,
  defineComponent,
  Fragment,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watchEffect,
} from 'vue';
import type { ComponentPublicInstance, DefineComponent, PropType, VNode } from 'vue';

export interface PopoverProps {
  readonly contentId: string;
  readonly ariaLabel: string;
  readonly content: string;
  readonly modelValue?: boolean;
  readonly defaultOpen?: boolean;
  readonly disabled?: boolean;
  readonly placement?: PopoverPlacement;
  readonly closeOnEscape?: boolean;
  readonly closeOnOutsidePointer?: boolean;
  readonly restoreFocus?: boolean;
}

export const Popover = defineComponent({
  name: 'MorfiraPopover',
  inheritAttrs: false,
  props: {
    contentId: { type: String, required: true },
    ariaLabel: { type: String, required: true },
    content: { type: String, required: true },
    modelValue: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    placement: {
      type: String as PropType<PopoverPlacement>,
      default: 'block-end',
      validator: (value: unknown) =>
        POPOVER_PLACEMENTS.includes(value as PopoverPlacement),
    },
    closeOnEscape: { type: Boolean, default: true },
    closeOnOutsidePointer: { type: Boolean, default: true },
    restoreFocus: { type: Boolean, default: true },
  },
  emits: {
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    openChange: (open: boolean, reason: PopoverDismissReason) =>
      typeof open === 'boolean' && Boolean(reason),
  },
  setup(props, { attrs, emit, slots }): () => VNode {
    const uncontrolled = ref(props.defaultOpen);
    const trigger = shallowRef<HTMLElement | null>(null);
    const content = shallowRef<HTMLElement | null>(null);
    const controller = shallowRef<PopoverController | null>(null);
    const currentOpen = () => props.modelValue ?? uncontrolled.value ?? false;
    const request = (open: boolean, reason: PopoverDismissReason) => {
      if (props.modelValue === undefined) uncontrolled.value = open;
      emit('update:modelValue', open);
      emit('openChange', open, reason);
    };
    const options = (): PopoverDomOptions => ({
      contentId: props.contentId,
      open: currentOpen(),
      disabled: props.disabled ?? false,
      placement: props.placement ?? 'block-end',
      closeOnEscape: props.closeOnEscape ?? true,
      closeOnOutsidePointer: props.closeOnOutsidePointer ?? true,
      restoreFocus: props.restoreFocus ?? true,
      onOpenChange: request,
    });
    onMounted(() => {
      if (trigger.value && content.value)
        controller.value = enhancePopover(trigger.value, content.value, options());
    });
    watchEffect(() => controller.value?.update(options()));
    onBeforeUnmount(() => {
      controller.value?.destroy();
      controller.value = null;
    });
    return () => {
      const state = resolvePopoverOptions(options());
      const child = slots.default?.()[0];
      if (!child)
        throw new TypeError('Popover requires one trigger in the default slot.');
      return h(Fragment, null, [
        cloneVNode(
          child,
          {
            ...attrs,
            ref: (value: Element | ComponentPublicInstance | null) => {
              const element =
                value instanceof Element
                  ? value
                  : value?.$el instanceof Element
                    ? value.$el
                    : null;
              trigger.value = element as HTMLElement | null;
            },
            'aria-controls': state.contentId,
            'aria-expanded': state.open,
            'aria-haspopup': 'dialog',
            'data-morfira-popover-trigger': '',
            'data-state': state.open ? 'open' : 'closed',
          },
          true,
        ),
        h(
          'div',
          {
            ref: (value: Element | ComponentPublicInstance | null) => {
              content.value = value as HTMLElement | null;
            },
            id: state.contentId,
            role: 'dialog',
            'aria-label': props.ariaLabel,
            popover: 'manual',
            hidden: !state.open,
            'data-morfira-popover': '',
            'data-placement': state.placement,
            'data-state': state.open ? 'open' : 'closed',
          },
          slots.content?.() ?? props.content,
        ),
      ]);
    };
  },
}) as DefineComponent<PopoverProps>;
