export interface ComboboxOption {
  readonly id: string;
  readonly value: string;
  readonly label: string;
  readonly keywords?: readonly string[];
  readonly disabled?: boolean;
}

export interface ResolvedComboboxOption {
  readonly id: string;
  readonly value: string;
  readonly label: string;
  readonly keywords: readonly string[];
  readonly disabled: boolean;
}

export interface ComboboxStateOptions {
  readonly inputId: string;
  readonly listboxId: string;
  readonly options: readonly ComboboxOption[];
  readonly query?: string;
  readonly selectedValue?: string;
  readonly activeId?: string;
  readonly open?: boolean;
  readonly filter?: boolean;
}

export interface ResolvedComboboxState {
  readonly inputId: string;
  readonly listboxId: string;
  readonly options: readonly ResolvedComboboxOption[];
  readonly visibleOptions: readonly ResolvedComboboxOption[];
  readonly query: string;
  readonly selectedValue: string | undefined;
  readonly activeId: string | undefined;
  readonly open: boolean;
}

function requireId(value: string, name: string): string {
  if (value.trim().length === 0 || /[\t\n\f\r ]/u.test(value)) {
    throw new TypeError(
      `Combobox ${name} must be a non-empty ID without ASCII whitespace.`,
    );
  }
  return value;
}

export function filterComboboxOptions(
  options: readonly ResolvedComboboxOption[],
  query: string,
): readonly ResolvedComboboxOption[] {
  const term = query.trim().toLocaleLowerCase();
  if (term.length === 0) return options;
  return options.filter((option) =>
    [option.label, option.value, ...option.keywords].some((candidate) =>
      candidate.toLocaleLowerCase().includes(term),
    ),
  );
}

export function resolveComboboxState(
  options: ComboboxStateOptions,
): ResolvedComboboxState {
  const inputId = requireId(options.inputId, 'inputId');
  const listboxId = requireId(options.listboxId, 'listboxId');
  if (inputId === listboxId) {
    throw new TypeError('Combobox inputId and listboxId must be unique.');
  }
  const ids = new Set<string>([inputId, listboxId]);
  const values = new Set<string>();
  const resolved = options.options.map((option) => {
    const id = requireId(option.id, 'option id');
    if (ids.has(id)) throw new TypeError('Combobox IDs must be unique.');
    if (values.has(option.value)) {
      throw new TypeError('Combobox option values must be unique.');
    }
    ids.add(id);
    values.add(option.value);
    return {
      id,
      value: option.value,
      label: option.label,
      keywords: option.keywords ?? [],
      disabled: option.disabled ?? false,
    };
  });
  const query = options.query ?? '';
  const visibleOptions =
    options.filter === false ? resolved : filterComboboxOptions(resolved, query);
  const selected = resolved.find(
    (option) => option.value === options.selectedValue && !option.disabled,
  );
  const active = visibleOptions.find(
    (option) => option.id === options.activeId && !option.disabled,
  );
  const open = options.open ?? false;
  return {
    inputId,
    listboxId,
    options: resolved,
    visibleOptions,
    query,
    selectedValue: selected?.value,
    activeId: open ? (active?.id ?? undefined) : undefined,
    open,
  };
}

export function moveComboboxActiveId(
  options: readonly ResolvedComboboxOption[],
  activeId: string | undefined,
  direction: -1 | 1 | 'first' | 'last',
): string | undefined {
  const enabled = options.filter((option) => !option.disabled);
  if (enabled.length === 0) return undefined;
  if (direction === 'first') return enabled[0]?.id;
  if (direction === 'last') return enabled.at(-1)?.id;
  const current = enabled.findIndex((option) => option.id === activeId);
  if (current < 0) return direction === 1 ? enabled[0]?.id : enabled.at(-1)?.id;
  return enabled[Math.max(0, Math.min(enabled.length - 1, current + direction))]?.id;
}

export interface AsyncRequestGate {
  next(): number;
  isCurrent(token: number): boolean;
  invalidate(): void;
}

export function createAsyncRequestGate(): AsyncRequestGate {
  let current = 0;
  let active = true;
  return {
    next() {
      active = true;
      current += 1;
      return current;
    },
    isCurrent(token) {
      return active && token === current;
    },
    invalidate() {
      active = false;
      current += 1;
    },
  };
}
