import { resolveRadioOptions } from '@morfira-dev/core/radio';
import type { RadioOptions } from '@morfira-dev/core/radio';
import type { ComponentPropsWithoutRef, ReactElement, Ref } from 'react';

type NativeRadioProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  keyof RadioOptions | 'size' | 'type'
>;

export interface RadioProps extends NativeRadioProps, RadioOptions {
  readonly ref?: Ref<HTMLInputElement>;
}

export function Radio({
  checked,
  disabled = false,
  ref,
  required = false,
  size = 'md',
  ...nativeProps
}: RadioProps): ReactElement {
  const options = resolveRadioOptions({
    ...(checked === undefined ? {} : { checked }),
    disabled,
    required,
    size,
  });

  return (
    <input
      {...nativeProps}
      ref={ref}
      type="radio"
      checked={checked}
      disabled={options.disabled}
      required={options.required}
      data-morfira-radio=""
      data-size={options.size}
    />
  );
}
