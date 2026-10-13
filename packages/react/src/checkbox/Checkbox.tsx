import { resolveCheckboxOptions } from '@morfira-dev/core/checkbox';
import type { CheckboxOptions } from '@morfira-dev/core/checkbox';
import {
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type Ref,
} from 'react';

import { mergeRefs } from '../internal/merge-refs.js';

type NativeCheckboxProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  keyof CheckboxOptions | 'aria-checked' | 'size' | 'type'
>;

export interface CheckboxProps extends NativeCheckboxProps, CheckboxOptions {
  readonly ref?: Ref<HTMLInputElement>;
}

export function Checkbox({
  checked,
  disabled = false,
  indeterminate = false,
  ref,
  required = false,
  size = 'md',
  ...nativeProps
}: CheckboxProps): ReactElement {
  const options = resolveCheckboxOptions({
    ...(checked === undefined ? {} : { checked }),
    disabled,
    indeterminate,
    required,
    size,
  });
  const elementRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    if (elementRef.current !== null) {
      elementRef.current.indeterminate = options.indeterminate;
    }
  });

  return (
    <input
      {...nativeProps}
      ref={mergeRefs(elementRef, ref)}
      type="checkbox"
      checked={checked}
      disabled={options.disabled}
      required={options.required}
      aria-checked={options.ariaChecked}
      data-morfira-checkbox=""
      data-size={options.size}
      data-indeterminate={options.indeterminate ? '' : undefined}
    />
  );
}
