import { resolveInputOptions } from '@morfira-dev/core/input';
import type { InputOptions } from '@morfira-dev/core/input';
import type { ComponentPropsWithoutRef, ReactElement, Ref } from 'react';

import { useFieldContext } from '../field/context.js';

type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | keyof InputOptions
  | 'aria-invalid'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'aria-errormessage'
>;

export interface InputProps extends NativeInputProps, InputOptions {
  readonly ref?: Ref<HTMLInputElement>;
}

export function Input({
  disabled = false,
  readOnly = false,
  ref,
  required = false,
  size = 'md',
  validation = 'none',
  ...nativeProps
}: InputProps): ReactElement {
  const field = useFieldContext();
  const options =
    field ?? resolveInputOptions({ disabled, readOnly, required, size, validation });

  return (
    <input
      {...nativeProps}
      ref={ref}
      id={field?.ids.inputId ?? nativeProps.id}
      disabled={options.disabled}
      readOnly={options.readOnly}
      required={options.required}
      aria-invalid={options.ariaInvalid}
      aria-labelledby={field?.ids.labelId}
      aria-describedby={field?.describedBy}
      aria-errormessage={field?.errorMessageId}
      data-morfira-input=""
      data-size={options.size}
      data-validation={options.validation}
    />
  );
}
