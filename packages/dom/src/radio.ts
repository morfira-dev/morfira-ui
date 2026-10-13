import {
  resolveRadioOptions,
  type RadioOptions,
  type ResolvedRadioOptions,
} from '@morfira-dev/core/radio';

const ATTRIBUTES = [
  'type',
  'disabled',
  'required',
  'data-morfira-radio',
  'data-size',
] as const;

export interface RadioController {
  readonly state: ResolvedRadioOptions;
  update(options: RadioOptions): void;
  destroy(): void;
}

export function enhanceRadio(
  input: HTMLInputElement,
  initialOptions: RadioOptions = {},
): RadioController {
  const attributes = new Map(
    ATTRIBUTES.map((name) => [name, input.getAttribute(name)] as const),
  );
  const checked = input.checked;
  let state = resolveRadioOptions(initialOptions);
  let destroyed = false;

  const apply = (): void => {
    input.type = 'radio';
    input.checked = state.checked;
    input.disabled = state.disabled;
    input.required = state.required;
    input.setAttribute('data-morfira-radio', '');
    input.setAttribute('data-size', state.size);
  };

  apply();
  return {
    get state() {
      return state;
    },
    update(options) {
      if (!destroyed) {
        state = resolveRadioOptions(options);
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
      input.checked = checked;
    },
  };
}
