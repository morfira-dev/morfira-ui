import {
  TEXTAREA_RESIZE_MODES,
  TEXTAREA_SIZES,
  TEXTAREA_VALIDATIONS,
  resolveTextareaOptions,
} from '@morfira-dev/core/textarea';
import type {
  TextareaOptions,
  TextareaResize,
  TextareaSize,
  TextareaValidation,
} from '@morfira-dev/core/textarea';
import { defineComponent, h, inject, mergeProps } from 'vue';
import type { DefineComponent, PropType, TextareaHTMLAttributes, VNode } from 'vue';
import { fieldContextKey } from '../field/context.js';

type NativeTextareaProps = Omit<
  TextareaHTMLAttributes,
  | keyof TextareaOptions
  | 'aria-invalid'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'aria-errormessage'
  | 'size'
  | 'value'
>;
export interface TextareaProps extends NativeTextareaProps, TextareaOptions {
  readonly modelValue?: string;
}

export const Textarea = defineComponent({
  name: 'MorfiraTextarea',
  inheritAttrs: false,
  props: {
    modelValue: String,
    size: {
      type: String as PropType<TextareaSize>,
      default: 'md',
      validator: (value: unknown) => TEXTAREA_SIZES.includes(value as TextareaSize),
    },
    validation: {
      type: String as PropType<TextareaValidation>,
      default: 'none',
      validator: (value: unknown) =>
        TEXTAREA_VALIDATIONS.includes(value as TextareaValidation),
    },
    resize: {
      type: String as PropType<TextareaResize>,
      default: 'vertical',
      validator: (value: unknown) =>
        TEXTAREA_RESIZE_MODES.includes(value as TextareaResize),
    },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
  },
  emits: {
    'update:modelValue': (value: string) => typeof value === 'string',
    input: (event: Event) => Boolean(event),
    change: (event: Event) => Boolean(event),
  },
  setup(props, { attrs, emit }): () => VNode {
    const field = inject(fieldContextKey, null);
    return () => {
      const own = resolveTextareaOptions({
        size: props.size ?? 'md',
        validation: props.validation ?? 'none',
        resize: props.resize ?? 'vertical',
        disabled: props.disabled ?? false,
        readOnly: props.readOnly ?? false,
        required: props.required ?? false,
      });
      const state =
        field?.value === undefined
          ? own
          : {
              ...own,
              size: field.value.size,
              validation: field.value.validation,
              disabled: field.value.disabled,
              readOnly: field.value.readOnly,
              required: field.value.required,
              ariaInvalid: field.value.ariaInvalid,
            };
      return h(
        'textarea',
        mergeProps(attrs, {
          id: field?.value.ids.inputId ?? attrs.id,
          ...(props.modelValue === undefined ? {} : { value: props.modelValue }),
          disabled: state.disabled,
          readonly: state.readOnly,
          required: state.required,
          'aria-invalid': state.ariaInvalid,
          'aria-labelledby': field?.value.ids.labelId,
          'aria-describedby': field?.value.describedBy,
          'aria-errormessage': field?.value.errorMessageId,
          'data-morfira-textarea': '',
          'data-size': state.size,
          'data-validation': state.validation,
          'data-resize': state.resize,
          onInput: (event: Event) => {
            emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
            emit('input', event);
          },
          onChange: (event: Event) => {
            emit('change', event);
          },
        }),
      );
    };
  },
}) as DefineComponent<TextareaProps>;
