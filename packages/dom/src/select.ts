import {
  resolveSelectOptions,
  type SelectOptions,
  type ResolvedSelectOptions,
} from '@morfira-dev/core/select';

const ATTRIBUTES = [
  'disabled',
  'required',
  'multiple',
  'size',
  'aria-invalid',
  'data-morfira-select',
  'data-size',
  'data-validation',
  'data-multiple',
] as const;

export interface SelectController {
  readonly state: ResolvedSelectOptions;
  update(options: SelectOptions): void;
  destroy(): void;
}

export function enhanceSelect(
  select: HTMLSelectElement,
  initialOptions: SelectOptions = {},
): SelectController {
  const attributes = new Map(
    ATTRIBUTES.map((name) => [name, select.getAttribute(name)] as const),
  );
  let state = resolveSelectOptions(initialOptions);
  let destroyed = false;

  const apply = (): void => {
    select.disabled = state.disabled;
    select.required = state.required;
    select.multiple = state.multiple;
    if (state.visibleRows === undefined) select.removeAttribute('size');
    else select.size = state.visibleRows;
    select.setAttribute('data-morfira-select', '');
    select.setAttribute('data-size', state.size);
    select.setAttribute('data-validation', state.validation);
    select.toggleAttribute('data-multiple', state.multiple);
    if (state.ariaInvalid) select.setAttribute('aria-invalid', state.ariaInvalid);
    else select.removeAttribute('aria-invalid');
  };

  apply();
  return {
    get state() {
      return state;
    },
    update(options) {
      if (!destroyed) {
        state = resolveSelectOptions(options);
        apply();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const [name, value] of attributes) {
        if (value === null) select.removeAttribute(name);
        else select.setAttribute(name, value);
      }
    },
  };
}
