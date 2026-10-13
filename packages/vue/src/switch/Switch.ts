import { SWITCH_SIZES, resolveSwitchOptions } from '@morfira-dev/core/switch';
import type { SwitchOptions, SwitchSize } from '@morfira-dev/core/switch';
import { defineComponent, h, mergeProps, onBeforeUnmount, onMounted, ref } from 'vue';
import type { DefineComponent, InputHTMLAttributes, PropType, VNode } from 'vue';

type NativeSwitchProps = Omit<
  InputHTMLAttributes,
  keyof SwitchOptions | 'checked' | 'size' | 'type'
>;
export interface SwitchProps extends NativeSwitchProps, Omit<SwitchOptions, 'checked'> {
  readonly modelValue?: boolean;
}

export const Switch = defineComponent({
  name: 'MorfiraSwitch',
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, default: false },
    size: {
      type: String as PropType<SwitchSize>,
      default: 'md',
      validator: (value: unknown) => SWITCH_SIZES.includes(value as SwitchSize),
    },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
  },
  emits: {
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    change: (event: Event) => Boolean(event),
  },
  setup(props, { attrs, emit }): () => VNode {
    const element = ref<HTMLInputElement | null>(null);
    let resetVersion = 0;
    let form: HTMLFormElement | null = null;

    const reflectCheckedState = (input: HTMLInputElement): boolean => {
      const checked = input.checked;
      input.toggleAttribute('data-checked', checked);
      input.setAttribute('aria-checked', checked ? 'true' : 'false');
      return checked;
    };
    const handleReset = (event: Event): void => {
      const version = ++resetVersion;
      queueMicrotask(() => {
        const input = element.value;
        if (!event.defaultPrevented && version === resetVersion && input !== null) {
          emit('update:modelValue', reflectCheckedState(input));
        }
      });
    };

    onMounted(() => {
      form = element.value?.form ?? null;
      form?.addEventListener('reset', handleReset);
    });
    onBeforeUnmount(() => {
      resetVersion += 1;
      form?.removeEventListener('reset', handleReset);
    });

    return () => {
      const state = resolveSwitchOptions({
        checked: props.modelValue ?? false,
        size: props.size ?? 'md',
        disabled: props.disabled ?? false,
        required: props.required ?? false,
      });
      return h(
        'input',
        mergeProps(attrs, {
          ref: element,
          type: 'checkbox',
          role: 'switch',
          checked: state.checked,
          disabled: state.disabled,
          required: state.required,
          'aria-checked': state.ariaChecked,
          'data-morfira-switch': '',
          'data-size': state.size,
          'data-checked': state.checked ? '' : undefined,
          onChange: (event: Event) => {
            emit(
              'update:modelValue',
              reflectCheckedState(event.target as HTMLInputElement),
            );
            emit('change', event);
          },
        }),
      );
    };
  },
}) as DefineComponent<SwitchProps>;
