import {
  DROPDOWN_PLACEMENTS,
  resolveDropdownOptions,
} from '@morfira-dev/core/dropdown';
import type { DropdownPlacement } from '@morfira-dev/core/dropdown';
import {
  cloneVNode,
  defineComponent,
  Fragment,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
} from 'vue';
import type { ComponentPublicInstance, DefineComponent, PropType, VNode } from 'vue';

import { Menu, type VueMenuItem } from '../menu/Menu.js';

export interface DropdownProps {
  readonly contentId: string;
  readonly ariaLabel: string;
  readonly items: readonly VueMenuItem[];
  readonly modelValue?: boolean;
  readonly defaultOpen?: boolean;
  readonly disabled?: boolean;
  readonly placement?: DropdownPlacement;
  readonly closeOnEscape?: boolean;
  readonly closeOnOutsidePointer?: boolean;
  readonly restoreFocus?: boolean;
}

export const Dropdown = defineComponent({
  name: 'MorfiraDropdown',
  inheritAttrs: false,
  props: {
    contentId: { type: String, required: true },
    ariaLabel: { type: String, required: true },
    items: { type: Array as PropType<readonly VueMenuItem[]>, required: true },
    modelValue: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    placement: {
      type: String as PropType<DropdownPlacement>,
      default: 'block-end',
      validator: (value: unknown) =>
        DROPDOWN_PLACEMENTS.includes(value as DropdownPlacement),
    },
    closeOnEscape: { type: Boolean, default: true },
    closeOnOutsidePointer: { type: Boolean, default: true },
    restoreFocus: { type: Boolean, default: true },
  },
  emits: {
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    openChange: (value: boolean, reason: string) =>
      typeof value === 'boolean' && reason.length > 0,
    select: (id: string) => typeof id === 'string',
  },
  setup(props, { attrs, emit, slots }): () => VNode {
    const uncontrolled = ref(props.defaultOpen);
    const trigger = shallowRef<HTMLElement | null>(null);
    const content = shallowRef<HTMLElement | null>(null);
    const currentOpen = () => props.modelValue ?? uncontrolled.value ?? false;
    const request = (next: boolean, reason: string) => {
      if (props.disabled || next === currentOpen()) return;
      if (props.modelValue === undefined) uncontrolled.value = next;
      emit('update:modelValue', next);
      emit('openChange', next, reason);
    };
    const pointer = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        currentOpen() &&
        props.closeOnOutsidePointer !== false &&
        event.button === 0 &&
        event.isPrimary &&
        target &&
        !trigger.value?.contains(target) &&
        !content.value?.contains(target)
      )
        request(false, 'outside-pointer');
    };
    onMounted(() => {
      document.addEventListener('pointerdown', pointer);
    });
    onBeforeUnmount(() => {
      document.removeEventListener('pointerdown', pointer);
    });
    return () => {
      const state = resolveDropdownOptions({
        contentId: props.contentId,
        open: currentOpen(),
        disabled: props.disabled ?? false,
        placement: props.placement ?? 'block-end',
        closeOnEscape: props.closeOnEscape ?? true,
        closeOnOutsidePointer: props.closeOnOutsidePointer ?? true,
        restoreFocus: props.restoreFocus ?? true,
      });
      const child = slots.default?.()[0];
      if (!child)
        throw new TypeError('Dropdown requires one trigger in the default slot.');
      const close = (reason: 'escape' | 'tab' | 'select') => {
        if (reason !== 'escape' || state.closeOnEscape) request(false, reason);
        if (reason !== 'tab' && state.restoreFocus) trigger.value?.focus();
      };
      return h(Fragment, null, [
        cloneVNode(
          child,
          {
            ...attrs,
            ref: (value: Element | ComponentPublicInstance | null) => {
              trigger.value = (
                value instanceof Element ? value : value?.$el
              ) as HTMLElement | null;
            },
            'aria-controls': state.contentId,
            'aria-expanded': state.open,
            'aria-haspopup': 'menu',
            'data-morfira-dropdown-trigger': '',
            'data-state': state.open ? 'open' : 'closed',
            onClick: () => {
              request(!state.open, 'trigger');
            },
            onKeydown: (event: KeyboardEvent) => {
              if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
              event.preventDefault();
              request(true, event.key === 'ArrowDown' ? 'arrow-first' : 'arrow-last');
              queueMicrotask(() => {
                const available = content.value?.querySelectorAll<HTMLElement>(
                  '[data-morfira-menu-item]:not([aria-disabled="true"])',
                );
                available?.[
                  event.key === 'ArrowUp' ? available.length - 1 : 0
                ]?.focus();
              });
            },
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
            hidden: !state.open,
            'data-morfira-dropdown': '',
            'data-placement': state.placement,
            'data-state': state.open ? 'open' : 'closed',
          },
          [
            h(Menu, {
              items: props.items,
              ariaLabel: props.ariaLabel,
              onSelect: (id: string) => {
                emit('select', id);
              },
              onDismiss: close,
            }),
          ],
        ),
      ]);
    };
  },
}) as DefineComponent<DropdownProps>;
