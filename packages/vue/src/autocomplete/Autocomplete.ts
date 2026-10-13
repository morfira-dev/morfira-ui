import type { ComboboxOption } from '@morfira-dev/core/combobox';
import {
  defineComponent,
  h,
  type Component,
  type DefineComponent,
  type PropType,
  type VNode,
} from 'vue';
import { Combobox, type ComboboxProps } from '../combobox/Combobox.js';

export interface AutocompleteProps extends Omit<
  ComboboxProps,
  'defaultQuery' | 'defaultValue' | 'modelValue' | 'query'
> {
  readonly modelValue?: string;
  readonly defaultValue?: string;
}

export const Autocomplete = defineComponent({
  name: 'MorfiraAutocomplete',
  inheritAttrs: false,
  props: {
    inputId: { type: String, required: true },
    listboxId: { type: String, required: true },
    options: { type: Array as PropType<readonly ComboboxOption[]>, required: true },
    modelValue: String,
    defaultValue: String,
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    invalid: Boolean,
    loading: Boolean,
    inputAttrs: Object,
    emptyContent: null,
    loadingContent: null,
    loadOptions: Function,
  },
  emits: {
    'update:modelValue': (value: string) => typeof value === 'string',
    'update:open': (value: boolean) => typeof value === 'boolean',
    optionSelect: (option: ComboboxOption) => typeof option.value === 'string',
    loadError: null,
  },
  setup(props, { attrs, emit, slots }): () => VNode {
    return () =>
      h(
        Combobox as unknown as Component,
        {
          ...attrs,
          ...props,
          query: props.modelValue,
          defaultQuery: props.defaultValue,
          modelValue: undefined,
          'onUpdate:query': (value: string) => {
            emit('update:modelValue', value);
          },
          'onUpdate:open': (value: boolean) => {
            emit('update:open', value);
          },
          onSelectedValueChange: (value: string) => {
            const option = props.options.find((candidate) => candidate.value === value);
            if (option) emit('optionSelect', option);
          },
          onLoadError: (error: unknown) => {
            emit('loadError', error);
          },
        },
        slots,
      );
  },
}) as DefineComponent<AutocompleteProps>;
