import {
  SELECT_SIZES,
  SELECT_VALIDATIONS,
  resolveSelectOptions,
} from '@morfira-dev/core/select';
import type {
  SelectOptions,
  SelectSize,
  SelectValidation,
} from '@morfira-dev/core/select';
import { defineComponent, h, inject, mergeProps } from 'vue';
import type { DefineComponent, PropType, SelectHTMLAttributes, VNode } from 'vue';
import { fieldContextKey } from '../field/context.js';

export type SelectValue = string | number | readonly string[];
type NativeSelectProps = Omit<
  SelectHTMLAttributes,
  | keyof SelectOptions
  | 'aria-invalid'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'aria-errormessage'
  | 'size'
  | 'value'
>;
export interface SelectProps extends NativeSelectProps, SelectOptions {
  readonly modelValue?: SelectValue;
}

export const Select = defineComponent({
  name: 'MorfiraSelect',
  inheritAttrs: false,
  props: {
    modelValue: [String, Number, Array] as PropType<SelectValue>,
    size: {
      type: String as PropType<SelectSize>,
      default: 'md',
      validator: (value: unknown) => SELECT_SIZES.includes(value as SelectSize),
    },
    validation: {
      type: String as PropType<SelectValidation>,
      default: 'none',
      validator: (value: unknown) =>
        SELECT_VALIDATIONS.includes(value as SelectValidation),
    },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    visibleRows: Number,
  },
  emits: {
    'update:modelValue': (value: SelectValue) =>
      typeof value === 'string' || typeof value === 'number' || Array.isArray(value),
    change: (event: Event) => Boolean(event),
  },
  setup(props, { attrs, emit, slots }): () => VNode {
    const field = inject(fieldContextKey, null);
    return () => {
      const own = resolveSelectOptions({
        size: props.size ?? 'md',
        validation: props.validation ?? 'none',
        disabled: props.disabled ?? false,
        required: props.required ?? false,
        multiple: props.multiple ?? false,
        ...(props.visibleRows === undefined ? {} : { visibleRows: props.visibleRows }),
      });
      const state =
        field?.value === undefined
          ? own
          : {
              ...own,
              size: field.value.size,
              validation: field.value.validation,
              disabled: field.value.disabled,
              required: field.value.required,
              ariaInvalid: field.value.ariaInvalid,
            };
      return h(
        'select',
        mergeProps(attrs, {
          id: field?.value.ids.inputId ?? attrs.id,
          value: props.modelValue,
          disabled: state.disabled,
          required: state.required,
          multiple: state.multiple,
          size: state.visibleRows,
          'aria-invalid': state.ariaInvalid,
          'aria-labelledby': field?.value.ids.labelId,
          'aria-describedby': field?.value.describedBy,
          'aria-errormessage': field?.value.errorMessageId,
          'data-morfira-select': '',
          'data-size': state.size,
          'data-validation': state.validation,
          'data-multiple': state.multiple ? '' : undefined,
          onChange: (event: Event) => {
            const element = event.target as HTMLSelectElement;
            const value: SelectValue = state.multiple
              ? Array.from(element.selectedOptions, (option) => option.value)
              : element.value;
            emit('update:modelValue', value);
            emit('change', event);
          },
        }),
        slots.default?.(),
      );
    };
  },
}) as DefineComponent<SelectProps>;
