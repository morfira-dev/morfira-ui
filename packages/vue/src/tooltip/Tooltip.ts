import { TOOLTIP_PLACEMENTS, resolveTooltipOptions } from '@morfira-dev/core/tooltip';
import type { TooltipPlacement } from '@morfira-dev/core/tooltip';
import { enhanceTooltip } from '@morfira-dev/dom/tooltip';
import type { TooltipController, TooltipDomOptions } from '@morfira-dev/dom/tooltip';
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

type TooltipReason = Parameters<NonNullable<TooltipDomOptions['onOpenChange']>>[1];
export interface TooltipProps {
  readonly contentId: string;
  readonly content: string;
  readonly modelValue?: boolean;
  readonly defaultOpen?: boolean;
  readonly disabled?: boolean;
  readonly placement?: TooltipPlacement;
  readonly openDelay?: number;
  readonly closeDelay?: number;
}

export const Tooltip = defineComponent({
  name: 'MorfiraTooltip',
  inheritAttrs: false,
  props: {
    contentId: { type: String, required: true },
    content: { type: String, required: true },
    modelValue: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    placement: {
      type: String as PropType<TooltipPlacement>,
      default: 'block-start',
      validator: (value: unknown) =>
        TOOLTIP_PLACEMENTS.includes(value as TooltipPlacement),
    },
    openDelay: { type: Number, default: 500 },
    closeDelay: { type: Number, default: 100 },
  },
  emits: {
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    openChange: (open: boolean, reason: TooltipReason) =>
      typeof open === 'boolean' && Boolean(reason),
  },
  setup(props, { attrs, emit, slots }): () => VNode {
    const uncontrolled = ref(props.defaultOpen);
    const trigger = shallowRef<HTMLElement | null>(null);
    const content = shallowRef<HTMLElement | null>(null);
    const controller = shallowRef<TooltipController | null>(null);
    const currentOpen = () => props.modelValue ?? uncontrolled.value ?? false;
    const request = (open: boolean, reason: TooltipReason) => {
      if (props.modelValue === undefined) uncontrolled.value = open;
      emit('update:modelValue', open);
      emit('openChange', open, reason);
    };
    const options = (): TooltipDomOptions => ({
      contentId: props.contentId,
      open: currentOpen(),
      disabled: props.disabled ?? false,
      placement: props.placement ?? 'block-start',
      openDelay: props.openDelay ?? 500,
      closeDelay: props.closeDelay ?? 100,
      onOpenChange: request,
    });
    onMounted(() => {
      if (trigger.value && content.value)
        controller.value = enhanceTooltip(trigger.value, content.value, options());
    });
    watchEffect(() => controller.value?.update(options()));
    onBeforeUnmount(() => {
      controller.value?.destroy();
      controller.value = null;
    });
    return () => {
      const state = resolveTooltipOptions(options());
      const child = slots.default?.()[0];
      if (!child)
        throw new TypeError('Tooltip requires one trigger in the default slot.');
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
            ...(state.open ? { 'aria-describedby': state.contentId } : {}),
            'data-morfira-tooltip-trigger': '',
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
            role: 'tooltip',
            hidden: !state.open,
            'data-morfira-tooltip': '',
            'data-placement': state.placement,
            'data-state': state.open ? 'open' : 'closed',
          },
          slots.content?.() ?? props.content,
        ),
      ]);
    };
  },
}) as DefineComponent<TooltipProps>;
