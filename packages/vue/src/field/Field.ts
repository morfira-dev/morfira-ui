import { resolveFieldOptions } from '@morfira-dev/core/field';
import type {
  FieldIds,
  FieldOptions,
  ResolvedFieldOptions,
} from '@morfira-dev/core/field';
import { INPUT_SIZES, INPUT_VALIDATIONS } from '@morfira-dev/core/input';
import type { InputSize, InputValidation } from '@morfira-dev/core/input';
import { computed, defineComponent, h, mergeProps, provide } from 'vue';
import type {
  ComputedRef,
  DefineComponent,
  HTMLAttributes,
  PropType,
  VNode,
} from 'vue';

import { fieldContextKey } from './context.js';

type NativeFieldProps = Omit<
  HTMLAttributes,
  keyof FieldOptions | 'children' | 'prefix'
>;

interface FieldComponentProps extends FieldOptions {
  readonly label: string;
  readonly description?: string | undefined;
  readonly validationMessage?: string | undefined;
}

export interface FieldProps extends NativeFieldProps, FieldComponentProps {}

export const Field = defineComponent({
  name: 'MorfiraField',
  inheritAttrs: false,
  props: {
    ids: {
      type: Object as PropType<FieldIds>,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    description: String,
    validationMessage: String,
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
  setup(props, { attrs, slots }): () => VNode {
    const options: ComputedRef<ResolvedFieldOptions> = computed(() =>
      resolveFieldOptions({
        disabled: props.disabled ?? false,
        ids: props.ids,
        readOnly: props.readOnly ?? false,
        required: props.required ?? false,
        size: props.size ?? 'md',
        validation: props.validation ?? 'none',
      }),
    );

    provide(fieldContextKey, options);

    return (): VNode => {
      const field = options.value;
      const labelContent = slots.label?.() ?? props.label;
      const descriptionContent = slots.description?.() ?? props.description;
      const validationContent = slots.validationMessage?.() ?? props.validationMessage;

      return h(
        'div',
        mergeProps(attrs, {
          'data-morfira-field': '',
          'data-size': field.size,
          'data-validation': field.validation,
          'data-disabled': field.disabled ? '' : undefined,
          'data-readonly': field.readOnly ? '' : undefined,
          'data-required': field.required ? '' : undefined,
        }),
        [
          h(
            'label',
            {
              id: field.ids.labelId,
              for: field.ids.inputId,
              'data-morfira-field-label': '',
            },
            [
              labelContent,
              field.required
                ? h(
                    'span',
                    {
                      'aria-hidden': 'true',
                      'data-morfira-field-required': '',
                    },
                    '*',
                  )
                : null,
            ],
          ),
          h('div', { 'data-morfira-field-control': '' }, [
            slots.prefix
              ? h('span', { 'data-morfira-field-prefix': '' }, slots.prefix())
              : null,
            slots.default?.(),
            slots.suffix
              ? h('span', { 'data-morfira-field-suffix': '' }, slots.suffix())
              : null,
          ]),
          descriptionContent !== undefined && field.ids.descriptionId !== undefined
            ? h(
                'div',
                {
                  id: field.ids.descriptionId,
                  'data-morfira-field-message': '',
                  'data-message-kind': 'helper',
                },
                descriptionContent,
              )
            : null,
          validationContent !== undefined &&
          field.validation !== 'none' &&
          field.ids.validationMessageId !== undefined
            ? h(
                'div',
                {
                  id: field.ids.validationMessageId,
                  'data-morfira-field-message': '',
                  'data-message-kind': field.validation,
                },
                validationContent,
              )
            : null,
        ],
      );
    };
  },
}) as DefineComponent<FieldProps>;
