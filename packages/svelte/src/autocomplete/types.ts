import type { ComboboxOption } from '@morfira-dev/core/combobox';
import type { ComboboxProps } from '../combobox/types.js';
export interface AutocompleteProps extends Omit<
  ComboboxProps,
  | 'defaultQuery'
  | 'defaultSelectedValue'
  | 'onQueryChange'
  | 'onSelectedValueChange'
  | 'query'
  | 'selectedValue'
> {
  value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly onOptionSelect?: (option: ComboboxOption) => void;
}
