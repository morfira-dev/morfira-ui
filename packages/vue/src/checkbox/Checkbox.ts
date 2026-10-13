import { CHECKBOX_SIZES, resolveCheckboxOptions } from '@morfira-dev/core/checkbox';
import type { CheckboxOptions, CheckboxSize } from '@morfira-dev/core/checkbox';
import { defineComponent, h, mergeProps } from 'vue';
import type { DefineComponent, InputHTMLAttributes, PropType, VNode } from 'vue';

type NativeCheckboxProps = Omit<
  InputHTMLAttributes,
  keyof CheckboxOptions | 'checked' | 'size' | 'type'
>;
export interface CheckboxProps
  extends NativeCheckboxProps, Omit<CheckboxOptions, 'checked'> {
  readonly modelValue?: boolean;
}

export const Checkbox = defineComponent({
  name: 'MorfiraCheckbox',
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, default: false },
    size: {
      type: String as PropType<CheckboxSize>,
      default: 'md',
      validator: (value: unknown) => CHECKBOX_SIZES.includes(value as CheckboxSize),
    },
    indeterminate: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
  },
  emits: {
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    change: (event: Event) => Boolean(event),
  },
  setup(props, { attrs, emit }): () => VNode {
    return () => {
      const state = resolveCheckboxOptions({
        checked: props.modelValue ?? false,
        size: props.size ?? 'md',
        indeterminate: props.indeterminate ?? false,
        disabled: props.disabled ?? false,
        required: props.required ?? false,
      });
      return h(
        'input',
        mergeProps(attrs, {
          type: 'checkbox',
          checked: state.checked,
          indeterminate: state.indeterminate,
          disabled: state.disabled,
          required: state.required,
          'aria-checked': state.ariaChecked,
          'data-morfira-checkbox': '',
          'data-size': state.size,
          'data-indeterminate': state.indeterminate ? '' : undefined,
          onChange: (event: Event) => {
            emit('update:modelValue', (event.target as HTMLInputElement).checked);
            emit('change', event);
          },
        }),
      );
    };
  },
}) as DefineComponent<CheckboxProps>;
