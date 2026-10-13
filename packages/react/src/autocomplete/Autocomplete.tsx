import type { ComboboxOption } from '@morfira-dev/core/combobox';
import type { ReactElement } from 'react';
import { Combobox, type ComboboxProps } from '../combobox/Combobox.js';

export interface AutocompleteProps extends Omit<
  ComboboxProps,
  | 'defaultQuery'
  | 'defaultSelectedValue'
  | 'onQueryChange'
  | 'onSelectedValueChange'
  | 'query'
  | 'selectedValue'
> {
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly onOptionSelect?: (option: ComboboxOption) => void;
}

export function Autocomplete({
  defaultValue,
  onOptionSelect,
  onValueChange,
  options,
  value,
  ...props
}: AutocompleteProps): ReactElement {
  return (
    <Combobox
      {...props}
      options={options}
      {...(value === undefined ? {} : { query: value })}
      {...(defaultValue === undefined ? {} : { defaultQuery: defaultValue })}
      {...(onValueChange === undefined ? {} : { onQueryChange: onValueChange })}
      onSelectedValueChange={(selectedValue): void => {
        const option = options.find(
          ({ value: candidate }) => candidate === selectedValue,
        );
        if (option !== undefined) onOptionSelect?.(option);
      }}
    />
  );
}
