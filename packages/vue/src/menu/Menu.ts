import { findMenuMatch, resolveMenuOptions } from '@morfira-dev/core/menu';
import type { MenuItem } from '@morfira-dev/core/menu';
import { defineComponent, h, ref } from 'vue';
import type {
  ComponentPublicInstance,
  DefineComponent,
  HTMLAttributes,
  PropType,
  VNode,
  VNodeChild,
} from 'vue';

export interface VueMenuItem extends MenuItem {
  readonly label: VNodeChild;
}
export interface MenuProps extends Omit<HTMLAttributes, 'onSelect'> {
  readonly items: readonly VueMenuItem[];
  readonly ariaLabel: string;
  readonly loop?: boolean;
  readonly typeaheadTimeout?: number;
}

export const Menu = defineComponent({
  name: 'MorfiraMenu',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<readonly VueMenuItem[]>, required: true },
    ariaLabel: { type: String, required: true },
    loop: { type: Boolean, default: true },
    typeaheadTimeout: { type: Number, default: 700 },
  },
  emits: {
    select: (id: string) => typeof id === 'string',
    dismiss: (reason: 'escape' | 'tab' | 'select') => Boolean(reason),
  },
  setup(props, { attrs, emit }): () => VNode {
    const active = ref(0);
    const elements = ref<(HTMLButtonElement | null)[]>([]);
    let query = '';
    let timer: ReturnType<typeof setTimeout> | undefined;
    return () => {
      const state = resolveMenuOptions({
        items: props.items,
        loop: props.loop ?? true,
        typeaheadTimeout: props.typeaheadTimeout ?? 700,
      });
      const enabled = state.items
        .map((item, index) => (item.disabled ? -1 : index))
        .filter((index) => index >= 0);
      if (state.items[active.value]?.disabled !== false)
        active.value = enabled[0] ?? -1;
      const focus = (index: number) => {
        if (state.items[index]?.disabled) return;
        active.value = index;
        elements.value[index]?.focus({ preventScroll: true });
      };
      const keydown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const position = Math.max(0, enabled.indexOf(active.value));
          const delta = event.key === 'ArrowDown' ? 1 : -1;
          const candidate = position + delta;
          const next = state.loop
            ? ((candidate % enabled.length) + enabled.length) % enabled.length
            : Math.max(0, Math.min(enabled.length - 1, candidate));
          const index = enabled[next];
          if (index !== undefined) focus(index);
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          const index = event.key === 'Home' ? enabled[0] : enabled.at(-1);
          if (index !== undefined) focus(index);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          emit('dismiss', 'escape');
        } else if (event.key === 'Tab') emit('dismiss', 'tab');
        else if (
          event.key.length === 1 &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey
        ) {
          event.preventDefault();
          const repeated =
            query.length > 0 && Array.from(query).every((v) => v === event.key);
          query = repeated ? event.key : `${query}${event.key}`;
          const index = findMenuMatch(state.items, query, active.value);
          if (index >= 0) focus(index);
          if (timer !== undefined) clearTimeout(timer);
          timer = setTimeout(() => {
            query = '';
          }, state.typeaheadTimeout);
        }
      };
      return h(
        'div',
        {
          ...attrs,
          role: 'menu',
          'aria-label': props.ariaLabel,
          'data-morfira-menu': '',
          'data-orientation': 'vertical',
          onKeydown: keydown,
        },
        state.items.map((item, index) =>
          h(
            'button',
            {
              ref: (element: Element | ComponentPublicInstance | null) => {
                elements.value[index] = element as HTMLButtonElement | null;
              },
              id: item.id,
              type: 'button',
              role: 'menuitem',
              'aria-disabled': item.disabled || undefined,
              tabindex: !item.disabled && active.value === index ? 0 : -1,
              'data-morfira-menu-item': '',
              'data-state': item.disabled ? 'disabled' : 'enabled',
              onFocus: () => {
                if (!item.disabled) active.value = index;
              },
              onClick: () => {
                if (item.disabled) return;
                emit('select', item.id);
                emit('dismiss', 'select');
              },
            },
            [props.items[index]?.label],
          ),
        ),
      );
    };
  },
}) as DefineComponent<MenuProps>;
