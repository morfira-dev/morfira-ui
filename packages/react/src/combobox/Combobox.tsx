import {
  createAsyncRequestGate,
  moveComboboxActiveId,
  resolveComboboxState,
  type ComboboxOption,
} from '@morfira-dev/core/combobox';
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { mergeRefs } from '../internal/merge-refs.js';

type NativeRootProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange'>;
type NativeInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'children'
  | 'defaultValue'
  | 'disabled'
  | 'id'
  | 'onChange'
  | 'readOnly'
  | 'role'
  | 'value'
>;

export interface ComboboxProps extends NativeRootProps {
  readonly inputId: string;
  readonly listboxId: string;
  readonly options: readonly ComboboxOption[];
  readonly query?: string;
  readonly defaultQuery?: string;
  readonly selectedValue?: string;
  readonly defaultSelectedValue?: string;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly invalid?: boolean;
  readonly loading?: boolean;
  readonly loadOptions?: (
    query: string,
  ) => readonly ComboboxOption[] | Promise<readonly ComboboxOption[]>;
  readonly onQueryChange?: (query: string) => void;
  readonly onSelectedValueChange?: (value: string) => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onLoadError?: (error: unknown) => void;
  readonly renderOption?: (option: ComboboxOption) => ReactNode;
  readonly emptyContent?: ReactNode;
  readonly loadingContent?: ReactNode;
  readonly inputProps?: NativeInputProps;
  readonly inputRef?: Ref<HTMLInputElement>;
  readonly ref?: Ref<HTMLDivElement>;
}

export function Combobox({
  defaultOpen = false,
  defaultQuery = '',
  defaultSelectedValue,
  disabled = false,
  emptyContent = 'No results',
  inputId,
  inputProps,
  inputRef,
  invalid = false,
  listboxId,
  loadOptions,
  loading: controlledLoading,
  loadingContent = 'Loading…',
  onLoadError,
  onOpenChange,
  onQueryChange,
  onSelectedValueChange,
  open: controlledOpen,
  options,
  query: controlledQuery,
  readOnly = false,
  ref,
  renderOption,
  selectedValue: controlledSelectedValue,
  ...nativeProps
}: ComboboxProps): ReactElement {
  const [query, setQuery] = useState(defaultQuery);
  const [selectedValue, setSelectedValue] = useState(defaultSelectedValue);
  const [open, setOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState<string>();
  const [loadedOptions, setLoadedOptions] = useState<readonly ComboboxOption[]>();
  const [loading, setLoading] = useState(false);
  const gate = useRef(createAsyncRequestGate());
  const resolvedQuery = controlledQuery ?? query;
  const resolvedOpen = controlledOpen ?? open;
  const resolvedSelectedValue = controlledSelectedValue ?? selectedValue;
  const sourceOptions = loadedOptions ?? options;
  const state = resolveComboboxState({
    inputId,
    listboxId,
    options: sourceOptions,
    query: resolvedQuery,
    ...(resolvedSelectedValue === undefined
      ? {}
      : { selectedValue: resolvedSelectedValue }),
    ...(activeId === undefined ? {} : { activeId }),
    open: resolvedOpen,
    filter: loadOptions === undefined,
  });
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(
    () => () => {
      gate.current.invalidate();
    },
    [],
  );
  useEffect(() => {
    if (disabled) {
      gate.current.invalidate();
      setLoading(false);
    }
  }, [disabled]);

  const requestOpen = (next: boolean): void => {
    if (controlledOpen === undefined) setOpen(next);
    if (next !== resolvedOpen) onOpenChange?.(next);
    if (!next) setActiveId(undefined);
  };
  const requestQuery = (next: string): void => {
    if (controlledQuery === undefined) setQuery(next);
    if (next !== resolvedQuery) onQueryChange?.(next);
  };
  const runLoader = (nextQuery: string): void => {
    if (loadOptions === undefined) return;
    const token = gate.current.next();
    setLoading(true);
    void Promise.resolve()
      .then(() => loadOptions(nextQuery))
      .then(
        (nextOptions) => {
          if (!gate.current.isCurrent(token)) return;
          setLoadedOptions(nextOptions);
          setLoading(false);
        },
        (error: unknown) => {
          if (!gate.current.isCurrent(token)) return;
          setLoading(false);
          onLoadError?.(error);
        },
      );
  };
  const select = (option: ComboboxOption): void => {
    if (option.disabled) return;
    if (controlledSelectedValue === undefined) setSelectedValue(option.value);
    if (option.value !== resolvedSelectedValue) onSelectedValueChange?.(option.value);
    requestQuery(option.label);
    requestOpen(false);
  };
  const move = (direction: -1 | 1 | 'first' | 'last'): void => {
    const next = moveComboboxActiveId(
      state.visibleOptions,
      resolvedOpen ? state.activeId : undefined,
      direction,
    );
    setActiveId(next);
    requestOpen(true);
  };

  return (
    <div
      {...nativeProps}
      ref={mergeRefs(rootRef, ref)}
      data-morfira-combobox=""
      data-state={state.open ? 'open' : 'closed'}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      data-loading={(controlledLoading ?? loading) || undefined}
    >
      <input
        {...inputProps}
        ref={inputRef}
        id={state.inputId}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={state.listboxId}
        aria-expanded={state.open}
        aria-activedescendant={state.open ? state.activeId : undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        readOnly={readOnly}
        value={state.query}
        data-morfira-combobox-input=""
        onBlur={(event): void => {
          inputProps?.onBlur?.(event);
          if (!rootRef.current?.contains(event.relatedTarget)) requestOpen(false);
        }}
        onChange={(event): void => {
          const next = event.currentTarget.value;
          requestQuery(next);
          setActiveId(undefined);
          requestOpen(true);
          runLoader(next);
        }}
        onKeyDown={(event): void => {
          inputProps?.onKeyDown?.(event);
          if (event.defaultPrevented || disabled || readOnly) return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            move(event.key === 'ArrowDown' ? 1 : -1);
          } else if (state.open && (event.key === 'Home' || event.key === 'End')) {
            event.preventDefault();
            move(event.key === 'Home' ? 'first' : 'last');
          } else if (state.open && event.key === 'Enter') {
            const option = sourceOptions.find(({ id }) => id === state.activeId);
            if (option !== undefined && !option.disabled) {
              event.preventDefault();
              select(option);
            }
          } else if (state.open && event.key === 'Escape') {
            event.preventDefault();
            requestOpen(false);
          } else if (state.open && event.key === 'Tab') requestOpen(false);
        }}
      />
      <div
        id={state.listboxId}
        role="listbox"
        hidden={!state.open}
        data-morfira-combobox-listbox=""
      >
        {(controlledLoading ?? loading) ? (
          <div role="status">{loadingContent}</div>
        ) : null}
        {!(controlledLoading ?? loading) && state.visibleOptions.length === 0 ? (
          <div role="status">{emptyContent}</div>
        ) : null}
        {state.visibleOptions.map((option) => {
          const active = option.id === state.activeId;
          const selected = option.value === state.selectedValue;
          return (
            <div
              key={option.id}
              id={option.id}
              role="option"
              aria-selected={selected}
              aria-disabled={option.disabled || undefined}
              data-morfira-combobox-option=""
              data-active={active || undefined}
              data-selected={selected || undefined}
              data-disabled={option.disabled || undefined}
              onPointerDown={(event): void => {
                if (event.button === 0 && event.isPrimary) event.preventDefault();
              }}
              onClick={(): void => {
                select(option);
              }}
            >
              {renderOption?.(option) ?? option.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
