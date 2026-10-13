import {
  moveComboboxActiveId,
  resolveComboboxState,
  type ComboboxStateOptions,
  type ResolvedComboboxState,
} from '@morfira-dev/core/combobox';

type Snapshot = ReadonlyMap<string, string | null>;
const ATTRIBUTES = [
  'id',
  'role',
  'hidden',
  'tabindex',
  'aria-autocomplete',
  'aria-controls',
  'aria-expanded',
  'aria-activedescendant',
  'aria-selected',
  'aria-disabled',
  'aria-invalid',
  'data-morfira-combobox',
  'data-morfira-combobox-input',
  'data-morfira-combobox-listbox',
  'data-morfira-combobox-option',
  'data-state',
  'data-active',
  'data-selected',
  'data-disabled',
  'data-loading',
  'data-invalid',
  'disabled',
  'readonly',
] as const;

const capture = (element: HTMLElement): Snapshot =>
  new Map(ATTRIBUTES.map((name) => [name, element.getAttribute(name)] as const));
const restore = (element: HTMLElement, snapshot: Snapshot): void => {
  for (const [name, value] of snapshot) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }
};
const toggleData = (element: HTMLElement, name: string, value: boolean): void => {
  if (value) element.setAttribute(name, '');
  else element.removeAttribute(name);
};

export type ComboboxChangeReason =
  'input' | 'keyboard' | 'pointer' | 'escape' | 'blur' | 'tab';

export interface ComboboxElements {
  readonly root: HTMLElement;
  readonly input: HTMLInputElement;
  readonly listbox: HTMLElement;
  readonly options: readonly HTMLElement[];
}

export interface ComboboxDomOptions extends ComboboxStateOptions {
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly invalid?: boolean;
  readonly loading?: boolean;
  readonly onQueryChange?: (query: string, reason: 'input' | 'selection') => void;
  readonly onOpenChange?: (open: boolean, reason: ComboboxChangeReason) => void;
  readonly onActiveChange?: (activeId: string | undefined) => void;
  readonly onValueChange?: (value: string, reason: 'keyboard' | 'pointer') => void;
}

export interface ComboboxController {
  readonly state: ResolvedComboboxState;
  update(options: ComboboxDomOptions): void;
  destroy(): void;
}

export function enhanceCombobox(
  elements: ComboboxElements,
  initialOptions: ComboboxDomOptions,
): ComboboxController {
  const all = [elements.root, elements.input, elements.listbox, ...elements.options];
  const snapshots = all.map(capture);
  const initialValue = elements.input.value;
  let options = initialOptions;
  let state = resolveComboboxState(initialOptions);
  let destroyed = false;

  const apply = (): void => {
    if (elements.options.length !== state.options.length) {
      throw new TypeError('Combobox requires one option element per option.');
    }
    const disabled = options.disabled ?? false;
    const invalid = options.invalid ?? false;
    elements.root.setAttribute('data-morfira-combobox', '');
    elements.root.setAttribute('data-state', state.open ? 'open' : 'closed');
    toggleData(elements.root, 'data-disabled', disabled);
    toggleData(elements.root, 'data-invalid', invalid);
    toggleData(elements.root, 'data-loading', options.loading ?? false);
    elements.input.id = state.inputId;
    elements.input.setAttribute('role', 'combobox');
    elements.input.setAttribute('aria-autocomplete', 'list');
    elements.input.setAttribute('aria-controls', state.listboxId);
    elements.input.setAttribute('aria-expanded', String(state.open));
    elements.input.setAttribute('data-morfira-combobox-input', '');
    elements.input.disabled = disabled;
    elements.input.readOnly = options.readOnly ?? false;
    elements.input.value = state.query;
    if (invalid) elements.input.setAttribute('aria-invalid', 'true');
    else elements.input.removeAttribute('aria-invalid');
    if (state.open && state.activeId !== undefined) {
      elements.input.setAttribute('aria-activedescendant', state.activeId);
    } else elements.input.removeAttribute('aria-activedescendant');
    elements.listbox.id = state.listboxId;
    elements.listbox.setAttribute('role', 'listbox');
    elements.listbox.setAttribute('data-morfira-combobox-listbox', '');
    elements.listbox.hidden = !state.open;
    const visibleIds = new Set(state.visibleOptions.map(({ id }) => id));
    state.options.forEach((item, index) => {
      const option = elements.options[index];
      if (option === undefined) return;
      const active = state.open && item.id === state.activeId;
      const selected = item.value === state.selectedValue;
      option.id = item.id;
      option.setAttribute('role', 'option');
      option.setAttribute('data-morfira-combobox-option', '');
      option.setAttribute('aria-selected', String(selected));
      option.tabIndex = -1;
      option.hidden = !visibleIds.has(item.id);
      toggleData(option, 'data-active', active);
      toggleData(option, 'data-selected', selected);
      toggleData(option, 'data-disabled', item.disabled);
      if (item.disabled) option.setAttribute('aria-disabled', 'true');
      else option.removeAttribute('aria-disabled');
    });
  };

  const requestOpen = (open: boolean, reason: ComboboxChangeReason): void => {
    if (open !== state.open) options.onOpenChange?.(open, reason);
  };
  const requestActive = (activeId: string | undefined): void => {
    if (activeId !== state.activeId) options.onActiveChange?.(activeId);
  };
  const select = (index: number, reason: 'keyboard' | 'pointer'): void => {
    const item = state.options[index];
    if (
      !item ||
      item.disabled ||
      !state.visibleOptions.some(({ id }) => id === item.id)
    )
      return;
    options.onValueChange?.(item.value, reason);
    options.onQueryChange?.(item.label, 'selection');
    requestOpen(false, reason);
  };
  const onInput = (): void => {
    if (options.disabled || options.readOnly) return;
    options.onQueryChange?.(elements.input.value, 'input');
    requestActive(undefined);
    requestOpen(true, 'input');
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (options.disabled || options.readOnly) return;
    let next: string | undefined;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      next = moveComboboxActiveId(
        state.visibleOptions,
        state.open ? state.activeId : undefined,
        event.key === 'ArrowDown' ? 1 : -1,
      );
      requestOpen(true, 'keyboard');
      requestActive(next);
    } else if (state.open && (event.key === 'Home' || event.key === 'End')) {
      event.preventDefault();
      next = moveComboboxActiveId(
        state.visibleOptions,
        state.activeId,
        event.key === 'Home' ? 'first' : 'last',
      );
      requestActive(next);
    } else if (state.open && event.key === 'Enter') {
      const index = state.options.findIndex(({ id }) => id === state.activeId);
      if (index >= 0) {
        event.preventDefault();
        select(index, 'keyboard');
      }
    } else if (state.open && event.key === 'Escape') {
      event.preventDefault();
      requestOpen(false, 'escape');
    } else if (state.open && event.key === 'Tab') {
      requestOpen(false, 'tab');
    }
  };
  const onBlur = (event: FocusEvent): void => {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !elements.root.contains(next)) {
      requestOpen(false, 'blur');
    }
  };
  const optionListeners = elements.options.map((option, index) => {
    const onPointerDown = (event: PointerEvent): void => {
      if (event.button === 0 && event.isPrimary) event.preventDefault();
    };
    const onClick = (): void => {
      select(index, 'pointer');
    };
    option.addEventListener('pointerdown', onPointerDown);
    option.addEventListener('click', onClick);
    return { onPointerDown, onClick };
  });
  elements.input.addEventListener('input', onInput);
  elements.input.addEventListener('keydown', onKeyDown);
  elements.input.addEventListener('blur', onBlur);
  apply();

  return {
    get state() {
      return state;
    },
    update(next) {
      if (destroyed) return;
      options = next;
      state = resolveComboboxState(next);
      apply();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      elements.input.removeEventListener('input', onInput);
      elements.input.removeEventListener('keydown', onKeyDown);
      elements.input.removeEventListener('blur', onBlur);
      optionListeners.forEach(({ onPointerDown, onClick }, index) => {
        elements.options[index]?.removeEventListener('pointerdown', onPointerDown);
        elements.options[index]?.removeEventListener('click', onClick);
      });
      all.forEach((element, index) => {
        const snapshot = snapshots[index];
        if (snapshot !== undefined) restore(element, snapshot);
      });
      elements.input.value = initialValue;
    },
  };
}
