import {
  TABS_ACTIVATION_MODES,
  TABS_ORIENTATIONS,
  resolveTabsOptions,
} from '@morfira-dev/core/tabs';
import type {
  TabItem,
  TabsActivationMode,
  TabsOrientation,
} from '@morfira-dev/core/tabs';
import { defineComponent, h, mergeProps, ref, watch } from 'vue';
import type {
  ComponentPublicInstance,
  DefineComponent,
  HTMLAttributes,
  PropType,
  VNode,
  VNodeChild,
} from 'vue';

export interface VueTabItem extends TabItem {
  readonly label: VNodeChild;
  readonly content: VNodeChild;
}
type NativeTabsProps = Omit<HTMLAttributes, 'children'>;
export interface TabsProps extends NativeTabsProps {
  readonly items: readonly VueTabItem[];
  readonly modelValue?: string;
  readonly defaultValue?: string;
  readonly orientation?: TabsOrientation;
  readonly activationMode?: TabsActivationMode;
  readonly loop?: boolean;
}

export const Tabs = defineComponent({
  name: 'MorfiraTabs',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<readonly VueTabItem[]>, required: true },
    modelValue: String,
    defaultValue: String,
    orientation: {
      type: String as PropType<TabsOrientation>,
      default: 'horizontal',
      validator: (value: unknown) =>
        TABS_ORIENTATIONS.includes(value as TabsOrientation),
    },
    activationMode: {
      type: String as PropType<TabsActivationMode>,
      default: 'automatic',
      validator: (value: unknown) =>
        TABS_ACTIVATION_MODES.includes(value as TabsActivationMode),
    },
    loop: { type: Boolean, default: true },
  },
  emits: {
    'update:modelValue': (value: string) => typeof value === 'string',
    selectedChange: (value: string) => typeof value === 'string',
  },
  setup(props, { attrs, emit }): () => VNode {
    const uncontrolled = ref(props.defaultValue);
    const focusedId = ref<string>();
    const tabs = ref<(HTMLButtonElement | null)[]>([]);
    watch(
      () => props.modelValue,
      (selectedId) => {
        if (selectedId !== undefined) focusedId.value = selectedId;
      },
    );
    return () => {
      const requestedSelectedId = props.modelValue ?? uncontrolled.value;
      const selectedId =
        props.modelValue === undefined &&
        requestedSelectedId !== undefined &&
        !props.items.some((item) => item.tabId === requestedSelectedId)
          ? undefined
          : requestedSelectedId;
      const state = resolveTabsOptions({
        items: props.items,
        ...(selectedId === undefined ? {} : { selectedId }),
        orientation: props.orientation ?? 'horizontal',
        activationMode: props.activationMode ?? 'automatic',
        loop: props.loop ?? true,
      });
      if (
        focusedId.value === undefined ||
        !state.items.some((item) => item.tabId === focusedId.value && !item.disabled)
      ) {
        focusedId.value = state.selectedId;
      }
      const select = (id: string) => {
        focusedId.value = id;
        if (props.modelValue === undefined) uncontrolled.value = id;
        if (id !== state.selectedId) {
          emit('update:modelValue', id);
          emit('selectedChange', id);
        }
      };
      const enabled = state.items
        .map((item, index) => (item.disabled ? -1 : index))
        .filter((index) => index >= 0);
      const keydown = (event: KeyboardEvent, index: number) => {
        const position = enabled.indexOf(index);
        let target: number | undefined;
        const rtl =
          (event.currentTarget as HTMLElement).closest<HTMLElement>('[dir]')?.dir ===
          'rtl';
        const previous =
          state.orientation === 'vertical'
            ? 'ArrowUp'
            : rtl
              ? 'ArrowRight'
              : 'ArrowLeft';
        const next =
          state.orientation === 'vertical'
            ? 'ArrowDown'
            : rtl
              ? 'ArrowLeft'
              : 'ArrowRight';
        if (event.key === previous) target = position - 1;
        else if (event.key === next) target = position + 1;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = enabled.length - 1;
        else if (
          state.activationMode === 'manual' &&
          (event.key === 'Enter' || event.key === ' ')
        ) {
          event.preventDefault();
          const item = state.items[index];
          if (item && !item.disabled) select(item.tabId);
          return;
        } else return;
        event.preventDefault();
        if (enabled.length === 0) return;
        const positionToUse = state.loop
          ? ((target % enabled.length) + enabled.length) % enabled.length
          : Math.max(0, Math.min(enabled.length - 1, target));
        const targetIndex = enabled[positionToUse];
        const item = targetIndex === undefined ? undefined : state.items[targetIndex];
        if (targetIndex === undefined || !item) return;
        focusedId.value = item.tabId;
        tabs.value[targetIndex]?.focus();
        if (state.activationMode === 'automatic') select(item.tabId);
      };
      return h(
        'div',
        mergeProps(attrs, {
          'data-morfira-tabs-root': '',
        }),
        [
          h(
            'div',
            {
              role: 'tablist',
              'aria-orientation': state.orientation,
              'data-morfira-tabs': '',
              'data-morfira-tab-list': '',
              'data-orientation': state.orientation,
            },
            state.items.map((item, index) => {
              const selected = item.tabId === state.selectedId;
              return h(
                'button',
                {
                  ref: (element: Element | ComponentPublicInstance | null) => {
                    tabs.value[index] = element as HTMLButtonElement | null;
                  },
                  id: item.tabId,
                  type: 'button',
                  role: 'tab',
                  disabled: item.disabled,
                  'aria-disabled': item.disabled || undefined,
                  'aria-controls': item.panelId,
                  'aria-selected': selected,
                  tabindex: item.tabId === focusedId.value ? 0 : -1,
                  'data-morfira-tab': '',
                  'data-state': selected ? 'active' : 'inactive',
                  onClick: () => {
                    select(item.tabId);
                  },
                  onKeydown: (event: KeyboardEvent) => {
                    keydown(event, index);
                  },
                },
                [props.items[index]?.label],
              );
            }),
          ),
          ...state.items.map((item, index) => {
            const selected = item.tabId === state.selectedId;
            return h(
              'div',
              {
                id: item.panelId,
                role: 'tabpanel',
                'aria-labelledby': item.tabId,
                hidden: !selected,
                tabindex: selected ? 0 : undefined,
                'data-morfira-tab-panel': '',
                'data-state': selected ? 'active' : 'inactive',
              },
              [props.items[index]?.content],
            );
          }),
        ],
      );
    };
  },
}) as DefineComponent<TabsProps>;
