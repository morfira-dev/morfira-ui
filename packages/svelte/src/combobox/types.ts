import type { ComboboxOption } from '@morfira-dev/core/combobox';
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';

export interface ComboboxProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onchange'
> {
  readonly inputId: string;
  readonly listboxId: string;
  readonly options: readonly ComboboxOption[];
  query?: string;
  readonly defaultQuery?: string;
  selectedValue?: string;
  readonly defaultSelectedValue?: string;
  open?: boolean;
  readonly defaultOpen?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly invalid?: boolean;
  readonly loading?: boolean;
  readonly inputProps?: Omit<
    HTMLInputAttributes,
    'disabled' | 'id' | 'readonly' | 'role' | 'value'
  >;
  readonly loadOptions?: (
    query: string,
  ) => readonly ComboboxOption[] | Promise<readonly ComboboxOption[]>;
  readonly onQueryChange?: (query: string) => void;
  readonly onSelectedValueChange?: (value: string) => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onLoadError?: (error: unknown) => void;
  readonly option?: Snippet<[ComboboxOption]>;
  readonly empty?: Snippet;
  readonly loadingContent?: Snippet;
  element?: HTMLInputElement | null;
}
