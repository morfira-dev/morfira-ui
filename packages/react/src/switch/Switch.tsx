import { resolveSwitchOptions } from '@morfira-dev/core/switch';
import type { SwitchOptions } from '@morfira-dev/core/switch';
import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type Ref,
} from 'react';

import { mergeRefs } from '../internal/merge-refs.js';

type NativeSwitchProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  keyof SwitchOptions | 'aria-checked' | 'role' | 'size' | 'type'
>;

export interface SwitchProps extends NativeSwitchProps, SwitchOptions {
  readonly ref?: Ref<HTMLInputElement>;
}

export function Switch({
  checked,
  disabled = false,
  ref,
  required = false,
  size = 'md',
  ...nativeProps
}: SwitchProps): ReactElement {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(
    Boolean(nativeProps.defaultChecked),
  );
  const elementRef = useRef<HTMLInputElement | null>(null);
  const renderedChecked = checked ?? uncontrolledChecked;
  const options = resolveSwitchOptions({
    checked: renderedChecked,
    disabled,
    required,
    size,
  });

  useLayoutEffect(() => {
    const input = elementRef.current;
    const form = input?.form;
    if (input === null || form == null) return;

    let resetVersion = 0;
    const handleReset = (event: Event): void => {
      const version = ++resetVersion;
      queueMicrotask(() => {
        if (!event.defaultPrevented && version === resetVersion) {
          if (checked === undefined) {
            setUncontrolledChecked(input.checked);
          } else {
            input.checked = checked;
            input.toggleAttribute('data-checked', checked);
            input.setAttribute('aria-checked', checked ? 'true' : 'false');
          }
        }
      });
    };
    form.addEventListener('reset', handleReset);
    return () => {
      resetVersion += 1;
      form.removeEventListener('reset', handleReset);
    };
  }, [checked]);

  return (
    <input
      {...nativeProps}
      ref={mergeRefs(elementRef, ref)}
      type="checkbox"
      role="switch"
      checked={checked}
      disabled={options.disabled}
      required={options.required}
      aria-checked={options.ariaChecked}
      data-morfira-switch=""
      data-size={options.size}
      data-checked={options.checked ? '' : undefined}
      onChange={(event): void => {
        if (checked === undefined) setUncontrolledChecked(event.currentTarget.checked);
        nativeProps.onChange?.(event);
      }}
    />
  );
}
