import { resolveFieldOptions } from '@morfira-dev/core/field';
import type { FieldOptions } from '@morfira-dev/core/field';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode, Ref } from 'react';

import { FieldContext } from './context.js';

type NativeFieldProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  keyof FieldOptions | 'children' | 'prefix'
>;

export interface FieldProps extends NativeFieldProps, FieldOptions {
  readonly label: ReactNode;
  readonly description?: ReactNode;
  readonly validationMessage?: ReactNode;
  readonly prefix?: ReactNode;
  readonly suffix?: ReactNode;
  readonly children: ReactNode;
  readonly ref?: Ref<HTMLDivElement>;
}

export function Field({
  children,
  description,
  disabled = false,
  ids,
  label,
  prefix,
  readOnly = false,
  ref,
  required = false,
  size = 'md',
  suffix,
  validation = 'none',
  validationMessage,
  ...nativeProps
}: FieldProps): ReactElement {
  const options = resolveFieldOptions({
    disabled,
    ids,
    readOnly,
    required,
    size,
    validation,
  });

  return (
    <FieldContext.Provider value={options}>
      <div
        {...nativeProps}
        ref={ref}
        data-morfira-field=""
        data-size={options.size}
        data-validation={options.validation}
        data-disabled={options.disabled ? '' : undefined}
        data-readonly={options.readOnly ? '' : undefined}
        data-required={options.required ? '' : undefined}
      >
        <label
          id={options.ids.labelId}
          htmlFor={options.ids.inputId}
          data-morfira-field-label=""
        >
          {label}
          {options.required ? (
            <span aria-hidden="true" data-morfira-field-required="">
              *
            </span>
          ) : null}
        </label>
        <div data-morfira-field-control="">
          {prefix === undefined ? null : (
            <span data-morfira-field-prefix="">{prefix}</span>
          )}
          {children}
          {suffix === undefined ? null : (
            <span data-morfira-field-suffix="">{suffix}</span>
          )}
        </div>
        {description !== undefined && options.ids.descriptionId !== undefined ? (
          <div
            id={options.ids.descriptionId}
            data-morfira-field-message=""
            data-message-kind="helper"
          >
            {description}
          </div>
        ) : null}
        {validationMessage !== undefined &&
        options.validation !== 'none' &&
        options.ids.validationMessageId !== undefined ? (
          <div
            id={options.ids.validationMessageId}
            data-morfira-field-message=""
            data-message-kind={options.validation}
          >
            {validationMessage}
          </div>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}
