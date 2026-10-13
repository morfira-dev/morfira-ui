import {
  BUTTON_SIZES,
  BUTTON_TYPES,
  BUTTON_VARIANTS,
  resolveButtonOptions,
} from '@morfira-dev/core/button';
import type {
  ButtonOptions,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from '@morfira-dev/core/button';
import { defineComponent, h, mergeProps } from 'vue';
import type { ButtonHTMLAttributes, DefineComponent, PropType, VNode } from 'vue';

type NativeButtonProps = Omit<ButtonHTMLAttributes, keyof ButtonOptions | 'aria-busy'>;

export interface ButtonProps extends NativeButtonProps, ButtonOptions {}

export const Button = defineComponent({
  name: 'MorfiraButton',
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<ButtonVariant>,
      default: 'primary',
      validator: (value: unknown): boolean =>
        BUTTON_VARIANTS.includes(value as ButtonVariant),
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: 'md',
      validator: (value: unknown): boolean =>
        BUTTON_SIZES.includes(value as ButtonSize),
    },
    type: {
      type: String as PropType<ButtonType>,
      default: 'button',
      validator: (value: unknown): boolean =>
        BUTTON_TYPES.includes(value as ButtonType),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    click: (event: MouseEvent): boolean => {
      return Boolean(event);
    },
  },
  setup(props, { attrs, emit, slots }): () => VNode {
    return (): VNode => {
      const options = resolveButtonOptions({
        disabled: props.disabled ?? false,
        loading: props.loading ?? false,
        size: props.size ?? 'md',
        type: props.type ?? 'button',
        variant: props.variant ?? 'primary',
      });

      const handleClick = (event: MouseEvent): void => {
        if (!options.interactive) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        emit('click', event);
      };

      return h(
        'button',
        mergeProps(attrs, {
          type: options.type,
          disabled: options.nativeDisabled,
          'aria-busy': options.loading ? 'true' : undefined,
          'data-morfira-button': '',
          'data-variant': options.variant,
          'data-size': options.size,
          'data-loading': options.loading ? '' : undefined,
          onClick: handleClick,
        }),
        slots.default?.(),
      );
    };
  },
}) as DefineComponent<ButtonProps>;
