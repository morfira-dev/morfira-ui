import { resolveSelectOptions } from '@morfira-dev/core/select';
import type { SelectOptions } from '@morfira-dev/core/select';
import type { ComponentPropsWithoutRef, ReactElement, Ref } from 'react';

import { useFieldContext } from '../field/context.js';

type NativeSelectProps = Omit<
  ComponentPropsWithoutRef<'select'>,
  | keyof SelectOptions
  | 'aria-describedby'
  | 'aria-errormessage'
  | 'aria-invalid'
  | 'aria-labelledby'
  | 'size'
>;

export interface SelectProps extends NativeSelectProps, SelectOptions {
  readonly visibleRows?: number;
  readonly ref?: Ref<HTMLSelectElement>;
}

export function Select({
  disabled = false,
  multiple = false,
  ref,
  required = false,
  size = 'md',
  validation = 'none',
  visibleRows,
  ...nativeProps
}: SelectProps): ReactElement {
  const field = useFieldContext();
  const options = resolveSelectOptions({
    disabled,
    multiple,
    required,
    size,
    validation,
    ...(visibleRows === undefined ? {} : { visibleRows }),
  });

  return (
    <select
      {...nativeProps}
      ref={ref}
      id={field?.ids.inputId ?? nativeProps.id}
      disabled={field?.disabled ?? options.disabled}
      required={field?.required ?? options.required}
      multiple={options.multiple}
      size={options.visibleRows}
      aria-invalid={field?.ariaInvalid ?? options.ariaInvalid}
      aria-labelledby={field?.ids.labelId}
      aria-describedby={field?.describedBy}
      aria-errormessage={field?.errorMessageId}
      data-morfira-select=""
      data-size={field?.size ?? options.size}
      data-validation={field?.validation ?? options.validation}
      data-multiple={options.multiple ? '' : undefined}
    />
  );
}
