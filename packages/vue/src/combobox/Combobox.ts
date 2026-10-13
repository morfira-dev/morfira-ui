import {
  createAsyncRequestGate,
  moveComboboxActiveId,
  resolveComboboxState,
} from '@morfira-dev/core/combobox';
import type { ComboboxOption } from '@morfira-dev/core/combobox';
import {
  defineComponent,
  h,
  mergeProps,
  onBeforeUnmount,
  ref,
  watch,
  type DefineComponent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';

type NativeComboboxProps = Omit<HTMLAttributes, 'onChange'>;
export interface ComboboxProps extends NativeComboboxProps {
  readonly inputId: string;
  readonly listboxId: string;
  readonly options: readonly ComboboxOption[];
  readonly modelValue?: string;
  readonly defaultValue?: string;
  readonly query?: string;
  readonly defaultQuery?: string;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly disabled?: boolean;
  readonly readonly?: boolean;
  readonly invalid?: boolean;
  readonly loading?: boolean;
  readonly inputAttrs?: InputHTMLAttributes;
  readonly emptyContent?: VNodeChild;
  readonly loadingContent?: VNodeChild;
  readonly loadOptions?: (
    query: string,
  ) => readonly ComboboxOption[] | Promise<readonly ComboboxOption[]>;
}

export const Combobox = defineComponent({
  name: 'MorfiraCombobox',
  inheritAttrs: false,
  props: {
    inputId: { type: String, required: true },
    listboxId: { type: String, required: true },
    options: { type: Array as PropType<readonly ComboboxOption[]>, required: true },
    modelValue: String,
    defaultValue: String,
    query: String,
    defaultQuery: { type: String, default: '' },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    invalid: Boolean,
    loading: Boolean,
    inputAttrs: Object as PropType<InputHTMLAttributes>,
    emptyContent: {
      type: null as unknown as PropType<VNodeChild>,
      default: 'No results',
    },
    loadingContent: {
      type: null as unknown as PropType<VNodeChild>,
      default: 'Loading…',
    },
    loadOptions: Function as PropType<ComboboxProps['loadOptions']>,
  },
  emits: {
    'update:modelValue': (value: string) => typeof value === 'string',
    'update:query': (value: string) => typeof value === 'string',
    'update:open': (value: boolean) => typeof value === 'boolean',
    queryChange: (value: string) => typeof value === 'string',
    selectedValueChange: (value: string) => typeof value === 'string',
    loadError: null,
  },
  setup(props, { attrs, emit, slots }): () => VNode {
    const uncontrolledValue = ref(props.defaultValue);
    const uncontrolledQuery = ref(props.defaultQuery ?? '');
    const uncontrolledOpen = ref(props.defaultOpen ?? false);
    const activeId = ref<string>();
    const loadedOptions = ref<readonly ComboboxOption[]>();
    const asyncLoading = ref(false);
    const gate = createAsyncRequestGate();
    const root = ref<HTMLDivElement>();
    onBeforeUnmount(() => {
      gate.invalidate();
    });
    watch(
      () => props.disabled,
      (disabled) => {
        if (disabled) {
          gate.invalidate();
          asyncLoading.value = false;
        }
      },
    );

    return () => {
      const query = props.query ?? uncontrolledQuery.value;
      const open = props.open ?? uncontrolledOpen.value;
      const selectedValue = props.modelValue ?? uncontrolledValue.value;
      const sourceOptions = loadedOptions.value ?? props.options;
      const state = resolveComboboxState({
        inputId: props.inputId,
        listboxId: props.listboxId,
        options: sourceOptions,
        query,
        ...(selectedValue === undefined ? {} : { selectedValue }),
        ...(activeId.value === undefined ? {} : { activeId: activeId.value }),
        open,
        filter: props.loadOptions === undefined,
      });
      const requestOpen = (next: boolean) => {
        if (props.open === undefined) uncontrolledOpen.value = next;
        if (next !== open) emit('update:open', next);
        if (!next) activeId.value = undefined;
      };
      const requestQuery = (next: string) => {
        if (props.query === undefined) uncontrolledQuery.value = next;
        if (next !== query) {
          emit('update:query', next);
          emit('queryChange', next);
        }
      };
      const runLoader = (next: string) => {
        if (props.loadOptions === undefined) return;
        const token = gate.next();
        asyncLoading.value = true;
        void Promise.resolve()
          .then(() => props.loadOptions?.(next) ?? [])
          .then(
            (nextOptions) => {
              if (!gate.isCurrent(token)) return;
              loadedOptions.value = nextOptions;
              asyncLoading.value = false;
            },
            (error: unknown) => {
              if (!gate.isCurrent(token)) return;
              asyncLoading.value = false;
              emit('loadError', error);
            },
          );
      };
      const select = (option: ComboboxOption) => {
        if (option.disabled) return;
        if (props.modelValue === undefined) uncontrolledValue.value = option.value;
        if (option.value !== selectedValue) {
          emit('update:modelValue', option.value);
          emit('selectedValueChange', option.value);
        }
        requestQuery(option.label);
        requestOpen(false);
      };
      const move = (direction: -1 | 1 | 'first' | 'last') => {
        activeId.value = moveComboboxActiveId(
          state.visibleOptions,
          open ? state.activeId : undefined,
          direction,
        );
        requestOpen(true);
      };
      const busy = props.loading || asyncLoading.value;
      return h(
        'div',
        mergeProps(attrs, {
          ref: root,
          'data-morfira-combobox': '',
          'data-state': state.open ? 'open' : 'closed',
          'data-disabled': props.disabled || undefined,
          'data-invalid': props.invalid || undefined,
          'data-loading': busy || undefined,
        }),
        [
          h('input', {
            ...props.inputAttrs,
            id: state.inputId,
            role: 'combobox',
            'aria-autocomplete': 'list',
            'aria-controls': state.listboxId,
            'aria-expanded': state.open,
            'aria-activedescendant': state.open ? state.activeId : undefined,
            'aria-invalid': props.invalid || undefined,
            disabled: props.disabled,
            readonly: props.readonly,
            value: state.query,
            'data-morfira-combobox-input': '',
            onInput: (event: Event) => {
              const next = (event.currentTarget as HTMLInputElement).value;
              requestQuery(next);
              activeId.value = undefined;
              requestOpen(true);
              runLoader(next);
            },
            onBlur: (event: FocusEvent) => {
              if (!root.value?.contains(event.relatedTarget as Node | null))
                requestOpen(false);
            },
            onKeydown: (event: KeyboardEvent) => {
              if (props.disabled || props.readonly) return;
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                move(event.key === 'ArrowDown' ? 1 : -1);
              } else if (state.open && (event.key === 'Home' || event.key === 'End')) {
                event.preventDefault();
                move(event.key === 'Home' ? 'first' : 'last');
              } else if (state.open && event.key === 'Enter') {
                const option = sourceOptions.find(({ id }) => id === state.activeId);
                if (option && !option.disabled) {
                  event.preventDefault();
                  select(option);
                }
              } else if (state.open && event.key === 'Escape') {
                event.preventDefault();
                requestOpen(false);
              } else if (state.open && event.key === 'Tab') requestOpen(false);
            },
          }),
          h(
            'div',
            {
              id: state.listboxId,
              role: 'listbox',
              hidden: !state.open,
              'data-morfira-combobox-listbox': '',
            },
            [
              busy
                ? h('div', { role: 'status' }, () => props.loadingContent)
                : undefined,
              !busy && state.visibleOptions.length === 0
                ? h('div', { role: 'status' }, () => props.emptyContent)
                : undefined,
              ...state.visibleOptions.map((option) =>
                h(
                  'div',
                  {
                    id: option.id,
                    role: 'option',
                    'aria-selected': option.value === state.selectedValue,
                    'aria-disabled': option.disabled || undefined,
                    'data-morfira-combobox-option': '',
                    'data-active': option.id === state.activeId || undefined,
                    'data-selected': option.value === state.selectedValue || undefined,
                    'data-disabled': option.disabled || undefined,
                    onPointerdown: (event: PointerEvent) => {
                      if (event.button === 0 && event.isPrimary) event.preventDefault();
                    },
                    onClick: () => {
                      select(option);
                    },
                  },
                  slots.option?.({ option }) ?? option.label,
                ),
              ),
            ],
          ),
        ],
      );
    };
  },
}) as DefineComponent<ComboboxProps>;
