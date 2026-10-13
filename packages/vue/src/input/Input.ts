import {
  INPUT_SIZES,
  INPUT_VALIDATIONS,
  resolveInputOptions,
} from '@morfira-dev/core/input';
import type { InputOptions, InputSize, InputValidation } from '@morfira-dev/core/input';
import { defineComponent, h, inject, mergeProps } from 'vue';
import type { DefineComponent, InputHTMLAttributes, PropType, VNode } from 'vue';

import { fieldContextKey } from '../field/context.js';

type NativeInputProps = Omit<
  InputHTMLAttributes,
  | keyof InputOptions
  | 'aria-invalid'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'aria-errormessage'
  | 'size'
  | 'value'
>;

interface InputComponentProps extends InputOptions {
  readonly modelValue?: string | number | undefined;
}

export interface InputProps extends NativeInputProps, InputComponentProps {}

export const Input = defineComponent({
  name: 'MorfiraInput',
  inheritAttrs: false,
  props: {
    modelValue: [String, Number],
    size: {
      type: String as PropType<InputSize>,
      default: 'md',
      validator: (value: unknown): boolean => INPUT_SIZES.includes(value as InputSize),
    },
    validation: {
      type: String as PropType<InputValidation>,
      default: 'none',
      validator: (value: unknown): boolean =>
        INPUT_VALIDATIONS.includes(value as InputValidation),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'update:modelValue': (value: string): boolean => typeof value === 'string',
    input: (event: Event): boolean => Boolean(event),
    change: (event: Event): boolean => Boolean(event),
  },
  setup(props, { attrs, emit }): () => VNode {
    const field = inject(fieldContextKey, null);

    return (): VNode => {
      const options =
        field?.value ??
        resolveInputOptions({
          disabled: props.disabled ?? false,
          readOnly: props.readOnly ?? false,
          required: props.required ?? false,
          size: props.size ?? 'md',
          validation: props.validation ?? 'none',
        });

      const handleInput = (event: Event): void => {
        emit('update:modelValue', (event.target as HTMLInputElement).value);
        emit('input', event);
      };

      return h(
        'input',
        mergeProps(attrs, {
          id: field?.value.ids.inputId ?? attrs.id,
          ...(props.modelValue === undefined ? {} : { value: props.modelValue }),
          disabled: options.disabled,
          readonly: options.readOnly,
          required: options.required,
          'aria-invalid': options.ariaInvalid,
          'aria-labelledby': field?.value.ids.labelId,
          'aria-describedby': field?.value.describedBy,
          'aria-errormessage': field?.value.errorMessageId,
          'data-morfira-input': '',
          'data-size': options.size,
          'data-validation': options.validation,
          onInput: handleInput,
          onChange: (event: Event): void => {
            emit('change', event);
          },
        }),
      );
    };
  },
}) as DefineComponent<InputProps>;
