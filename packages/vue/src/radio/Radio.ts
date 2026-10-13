import { RADIO_SIZES, resolveRadioOptions } from '@morfira-dev/core/radio';
import type { RadioOptions, RadioSize } from '@morfira-dev/core/radio';
import { defineComponent, h, mergeProps } from 'vue';
import type { DefineComponent, InputHTMLAttributes, PropType, VNode } from 'vue';

type NativeRadioProps = Omit<
  InputHTMLAttributes,
  keyof RadioOptions | 'checked' | 'size' | 'type' | 'value'
>;
export interface RadioProps extends NativeRadioProps, Omit<RadioOptions, 'checked'> {
  readonly modelValue?: string | number | boolean;
  readonly value: string | number | boolean;
}

export const Radio = defineComponent({
  name: 'MorfiraRadio',
  inheritAttrs: false,
  props: {
    modelValue: [String, Number, Boolean],
    value: { type: [String, Number, Boolean], required: true },
    size: {
      type: String as PropType<RadioSize>,
      default: 'md',
      validator: (value: unknown) => RADIO_SIZES.includes(value as RadioSize),
    },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
  },
  emits: {
    'update:modelValue': (value: string | number | boolean) =>
      ['string', 'number', 'boolean'].includes(typeof value),
    change: (event: Event) => Boolean(event),
  },
  setup(props, { attrs, emit }): () => VNode {
    return () => {
      const checked = Object.is(props.modelValue, props.value);
      const state = resolveRadioOptions({
        checked,
        size: props.size ?? 'md',
        disabled: props.disabled ?? false,
        required: props.required ?? false,
      });
      return h(
        'input',
        mergeProps(attrs, {
          type: 'radio',
          value: props.value,
          checked: state.checked,
          disabled: state.disabled,
          required: state.required,
          'data-morfira-radio': '',
          'data-size': state.size,
          onChange: (event: Event) => {
            if ((event.target as HTMLInputElement).checked)
              emit('update:modelValue', props.value);
            emit('change', event);
          },
        }),
      );
    };
  },
}) as DefineComponent<RadioProps>;
