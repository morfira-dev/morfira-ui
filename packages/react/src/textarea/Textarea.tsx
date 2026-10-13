import { resolveTextareaOptions } from '@morfira-dev/core/textarea';
import type { TextareaOptions } from '@morfira-dev/core/textarea';
import type { ComponentPropsWithoutRef, ReactElement, Ref } from 'react';

import { useFieldContext } from '../field/context.js';

type NativeTextareaProps = Omit<
  ComponentPropsWithoutRef<'textarea'>,
  | keyof TextareaOptions
  | 'aria-describedby'
  | 'aria-errormessage'
  | 'aria-invalid'
  | 'aria-labelledby'
>;

export interface TextareaProps extends NativeTextareaProps, TextareaOptions {
  readonly ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  disabled = false,
  readOnly = false,
  ref,
  required = false,
  resize = 'vertical',
  size = 'md',
  validation = 'none',
  ...nativeProps
}: TextareaProps): ReactElement {
  const field = useFieldContext();
  const options = resolveTextareaOptions({
    disabled,
    readOnly,
    required,
    resize,
    size,
    validation,
  });

  return (
    <textarea
      {...nativeProps}
      ref={ref}
      id={field?.ids.inputId ?? nativeProps.id}
      disabled={field?.disabled ?? options.disabled}
      readOnly={field?.readOnly ?? options.readOnly}
      required={field?.required ?? options.required}
      aria-invalid={field?.ariaInvalid ?? options.ariaInvalid}
      aria-labelledby={field?.ids.labelId}
      aria-describedby={field?.describedBy}
      aria-errormessage={field?.errorMessageId}
      data-morfira-textarea=""
      data-size={field?.size ?? options.size}
      data-validation={field?.validation ?? options.validation}
      data-resize={options.resize}
    />
  );
}
