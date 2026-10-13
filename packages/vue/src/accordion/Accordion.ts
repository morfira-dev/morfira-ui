import { resolveAccordionOptions } from '@morfira-dev/core/accordion';
import type { AccordionItem } from '@morfira-dev/core/accordion';
import { defineComponent, h, mergeProps, ref } from 'vue';
import type {
  ComponentPublicInstance,
  DefineComponent,
  HTMLAttributes,
  PropType,
  VNode,
  VNodeChild,
} from 'vue';

export interface VueAccordionItem extends AccordionItem {
  readonly title: VNodeChild;
  readonly content: VNodeChild;
}
type NativeAccordionProps = Omit<HTMLAttributes, 'children'>;
export interface AccordionProps extends NativeAccordionProps {
  readonly items: readonly VueAccordionItem[];
  readonly modelValue?: readonly string[];
  readonly defaultValue?: readonly string[];
  readonly multiple?: boolean;
  readonly collapsible?: boolean;
  readonly headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export const Accordion = defineComponent({
  name: 'MorfiraAccordion',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<readonly VueAccordionItem[]>, required: true },
    modelValue: Array as PropType<readonly string[]>,
    defaultValue: { type: Array as PropType<readonly string[]>, default: () => [] },
    multiple: { type: Boolean, default: false },
    collapsible: { type: Boolean, default: true },
    headingLevel: { type: Number as PropType<2 | 3 | 4 | 5 | 6>, default: 3 },
  },
  emits: {
    'update:modelValue': (value: readonly string[]) => Array.isArray(value),
    expandedChange: (value: readonly string[]) => Array.isArray(value),
  },
  setup(props, { attrs, emit }): () => VNode {
    const uncontrolled = ref<readonly string[]>(props.defaultValue ?? []);
    const triggers = ref<(HTMLElement | null)[]>([]);
    return () => {
      const requestedExpandedIds = props.modelValue ?? uncontrolled.value;
      const expandedIds =
        props.modelValue === undefined
          ? requestedExpandedIds.filter((id) =>
              props.items.some((item) => item.triggerId === id),
            )
          : requestedExpandedIds;
      const state = resolveAccordionOptions({
        items: props.items,
        expandedIds,
        multiple: props.multiple ?? false,
        collapsible: props.collapsible ?? true,
      });
      const enabled = state.items
        .map((item, index) => (item.disabled ? -1 : index))
        .filter((index) => index >= 0);
      const update = (value: readonly string[]) => {
        if (props.modelValue === undefined) uncontrolled.value = value;
        emit('update:modelValue', value);
        emit('expandedChange', value);
      };
      const toggle = (index: number) => {
        const item = state.items[index];
        if (!item || item.disabled) return;
        const expanded = state.expandedIds.includes(item.triggerId);
        if (expanded && !state.collapsible && state.expandedIds.length === 1) return;
        update(
          expanded
            ? state.expandedIds.filter((id) => id !== item.triggerId)
            : state.multiple
              ? [...state.expandedIds, item.triggerId]
              : [item.triggerId],
        );
      };
      const keydown = (event: KeyboardEvent, index: number) => {
        const position = enabled.indexOf(index);
        let target: number | undefined;
        if (event.key === 'ArrowDown') target = position + 1;
        else if (event.key === 'ArrowUp') target = position - 1;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = enabled.length - 1;
        else return;
        event.preventDefault();
        if (enabled.length === 0) return;
        const targetIndex =
          enabled[((target % enabled.length) + enabled.length) % enabled.length];
        if (targetIndex !== undefined) triggers.value[targetIndex]?.focus();
      };
      return h(
        'div',
        mergeProps(attrs, { 'data-morfira-accordion': '' }),
        state.items.map((item, index) => {
          const expanded = state.expandedIds.includes(item.triggerId);
          const trigger = h(
            'summary',
            {
              ref: (element: Element | ComponentPublicInstance | null) => {
                triggers.value[index] = element as HTMLElement | null;
              },
              id: item.triggerId,
              'aria-controls': item.panelId,
              'aria-expanded': expanded,
              'aria-disabled': item.disabled || undefined,
              tabindex: item.disabled ? -1 : undefined,
              'data-morfira-accordion-trigger': '',
              'data-state': expanded ? 'open' : 'closed',
              onClick: (event: MouseEvent) => {
                event.preventDefault();
                toggle(index);
              },
              onKeydown: (event: KeyboardEvent) => {
                keydown(event, index);
              },
            },
            [
              h('span', { role: 'heading', 'aria-level': props.headingLevel ?? 3 }, [
                props.items[index]?.title,
              ]),
            ],
          );
          return h(
            'details',
            {
              open: expanded,
              'data-morfira-accordion-item': '',
              'data-state': expanded ? 'open' : 'closed',
            },
            [
              trigger,
              h(
                'div',
                {
                  id: item.panelId,
                  role: 'region',
                  'aria-labelledby': item.triggerId,
                  hidden: !expanded,
                  'data-morfira-accordion-panel': '',
                  'data-state': expanded ? 'open' : 'closed',
                },
                [props.items[index]?.content],
              ),
            ],
          );
        }),
      );
    };
  },
}) as DefineComponent<AccordionProps>;
