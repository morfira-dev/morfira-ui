import {
  resolveSwitchOptions,
  type SwitchOptions,
  type ResolvedSwitchOptions,
} from '@morfira-dev/core/switch';

const ATTRIBUTES = [
  'type',
  'role',
  'disabled',
  'required',
  'aria-checked',
  'data-morfira-switch',
  'data-size',
  'data-checked',
] as const;

export interface SwitchController {
  readonly state: ResolvedSwitchOptions;
  update(options: SwitchOptions): void;
  destroy(): void;
}

export function enhanceSwitch(
  input: HTMLInputElement,
  initialOptions: SwitchOptions = {},
): SwitchController {
  const attributes = new Map(
    ATTRIBUTES.map((name) => [name, input.getAttribute(name)] as const),
  );
  const checked = input.checked;
  let state = resolveSwitchOptions(initialOptions);
  let destroyed = false;
  let resetVersion = 0;

  const apply = (): void => {
    input.type = 'checkbox';
    input.checked = state.checked;
    input.disabled = state.disabled;
    input.required = state.required;
    input.setAttribute('role', 'switch');
    input.setAttribute('data-morfira-switch', '');
    input.setAttribute('data-size', state.size);
    input.toggleAttribute('data-checked', state.checked);
    input.setAttribute('aria-checked', state.ariaChecked);
  };

  const synchronizeCheckedState = (): void => {
    if (destroyed) return;
    state = resolveSwitchOptions({ ...state, checked: input.checked });
    input.toggleAttribute('data-checked', state.checked);
    input.setAttribute('aria-checked', state.ariaChecked);
  };

  const handleChange = (): void => {
    synchronizeCheckedState();
  };

  const form = input.form;
  const handleReset = (event: Event): void => {
    const version = ++resetVersion;
    queueMicrotask(() => {
      if (!event.defaultPrevented && version === resetVersion) {
        synchronizeCheckedState();
      }
    });
  };

  apply();
  input.addEventListener('change', handleChange);
  form?.addEventListener('reset', handleReset);
  return {
    get state() {
      return state;
    },
    update(options) {
      if (!destroyed) {
        state = resolveSwitchOptions(options);
        apply();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      resetVersion += 1;
      input.removeEventListener('change', handleChange);
      form?.removeEventListener('reset', handleReset);
      for (const [name, value] of attributes) {
        if (value === null) input.removeAttribute(name);
        else input.setAttribute(name, value);
      }
      input.checked = checked;
    },
  };
}
