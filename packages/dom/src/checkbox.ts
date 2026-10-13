import {
  resolveCheckboxOptions,
  type CheckboxOptions,
  type ResolvedCheckboxOptions,
} from '@morfira-dev/core/checkbox';

const ATTRIBUTES = [
  'type',
  'disabled',
  'required',
  'aria-checked',
  'data-morfira-checkbox',
  'data-size',
  'data-indeterminate',
] as const;

export interface CheckboxController {
  readonly state: ResolvedCheckboxOptions;
  update(options: CheckboxOptions): void;
  destroy(): void;
}

export function enhanceCheckbox(
  input: HTMLInputElement,
  initialOptions: CheckboxOptions = {},
): CheckboxController {
  const attributes = new Map(
    ATTRIBUTES.map((name) => [name, input.getAttribute(name)] as const),
  );
  const properties = { checked: input.checked, indeterminate: input.indeterminate };
  let state = resolveCheckboxOptions(initialOptions);
  let destroyed = false;

  const apply = (): void => {
    input.type = 'checkbox';
    input.checked = state.checked;
    input.indeterminate = state.indeterminate;
    input.disabled = state.disabled;
    input.required = state.required;
    input.setAttribute('data-morfira-checkbox', '');
    input.setAttribute('data-size', state.size);
    input.toggleAttribute('data-indeterminate', state.indeterminate);
    if (state.ariaChecked) input.setAttribute('aria-checked', state.ariaChecked);
    else input.removeAttribute('aria-checked');
  };

  apply();
  return {
    get state() {
      return state;
    },
    update(options) {
      if (!destroyed) {
        state = resolveCheckboxOptions(options);
        apply();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const [name, value] of attributes) {
        if (value === null) input.removeAttribute(name);
        else input.setAttribute(name, value);
      }
      input.checked = properties.checked;
      input.indeterminate = properties.indeterminate;
    },
  };
}
